package com.wallet.service;

import com.wallet.dto.SendMoneyRequest;
import com.wallet.dto.TransactionResponse;
import com.wallet.entity.*;
import com.wallet.exception.InsufficientBalanceException;
import com.wallet.exception.InvalidTransactionException;
import com.wallet.exception.TransactionNotFoundException;
import com.wallet.exception.UserBlockedException;
import com.wallet.exception.UserNotFoundException;
import com.wallet.repository.TransactionRepository;
import com.wallet.repository.UserRepository;
import com.wallet.repository.WalletRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TransactionService(TransactionRepository transactionRepository,
                              WalletRepository walletRepository,
                              UserRepository userRepository,
                              NotificationService notificationService) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * Executes atomic user-to-user money transfer.
     * Uses @Transactional with SERIALIZABLE/READ_COMMITTED to ensure data integrity and rollback on any failure.
     */
    @Transactional(rollbackFor = Exception.class)
    public TransactionResponse sendMoney(User sender, SendMoneyRequest request) {
        // 1. Check sender status
        if (sender.getStatus() == UserStatus.BLOCKED) {
            throw new UserBlockedException("Your account is blocked. You cannot transfer money.");
        }

        // 2. Validate amount > 0
        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransactionException("Transfer amount must be greater than ₹0.");
        }
        amount = amount.setScale(2);

        // 3. Find receiver by email or phone
        String identifier = request.getRecipientIdentifier().trim().toLowerCase();
        User receiver = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .orElseThrow(() -> new UserNotFoundException("Recipient user not found with email/phone: " + identifier));

        // 4. Check receiver is ACTIVE
        if (receiver.getStatus() == UserStatus.BLOCKED) {
            throw new UserBlockedException("This recipient user is currently blocked or unavailable.");
        }

        // 5. Prevent transfer to self
        if (sender.getUserId().equals(receiver.getUserId())) {
            throw new InvalidTransactionException("You cannot transfer money to yourself.");
        }

        // 6. Check sender wallet and balance
        Wallet senderWallet = walletRepository.findByUser(sender)
                .orElseThrow(() -> new InsufficientBalanceException("Sender wallet not found."));

        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                    String.format("Insufficient wallet balance. Available: ₹%.2f, Required: ₹%.2f",
                            senderWallet.getBalance(), amount)
            );
        }

        // 7. Get or create receiver wallet
        Wallet receiverWallet = walletRepository.findByUser(receiver)
                .orElseGet(() -> new Wallet(receiver, BigDecimal.ZERO));

        // 8. Deduct from sender wallet & Add to receiver wallet
        BigDecimal newSenderBalance = senderWallet.getBalance().subtract(amount).setScale(2);
        if (newSenderBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new InsufficientBalanceException("Wallet balance cannot become negative.");
        }
        senderWallet.setBalance(newSenderBalance);

        BigDecimal newReceiverBalance = receiverWallet.getBalance().add(amount).setScale(2);
        receiverWallet.setBalance(newReceiverBalance);

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        // 9. Generate unique reference number
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String referenceNumber = "TXN" + timestamp + suffix;

        String description = request.getDescription() != null && !request.getDescription().trim().isEmpty()
                ? request.getDescription().trim()
                : "Money transfer to " + receiver.getName();

        // 10. Record transaction
        Transaction transaction = new Transaction(
                sender,
                receiver,
                amount,
                TransactionType.TRANSFER,
                TransactionStatus.SUCCESS,
                referenceNumber,
                description
        );
        Transaction savedTransaction = transactionRepository.save(transaction);

        // 11. Create notifications for both parties
        notificationService.createNotification(
                sender,
                String.format("₹%.2f sent to %s successfully. Ref: %s",
                        amount, receiver.getName(), referenceNumber)
        );

        notificationService.createNotification(
                receiver,
                String.format("You received ₹%.2f from %s. Ref: %s",
                        amount, sender.getName(), referenceNumber)
        );

        return mapToResponse(savedTransaction, sender);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactionHistory(
            User user,
            TransactionType type,
            TransactionStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            Pageable pageable) {

        return transactionRepository.findUserTransactionsFiltered(
                user, type, status, startDate, endDate, minAmount, maxAmount, pageable
        ).map(t -> mapToResponse(t, user));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getRecentTransactions(User user, Pageable pageable) {
        return transactionRepository.findRecentByUser(user, pageable)
                .stream()
                .map(t -> mapToResponse(t, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id, User currentUser) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with ID: " + id));

        boolean isSender = transaction.getSender() != null && transaction.getSender().getUserId().equals(currentUser.getUserId());
        boolean isReceiver = transaction.getReceiver() != null && transaction.getReceiver().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isSender && !isReceiver && !isAdmin) {
            throw new InvalidTransactionException("Access denied: You do not have permission to view this transaction.");
        }

        return mapToResponse(transaction, currentUser);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserSummary(User user) {
        BigDecimal totalSent = transactionRepository.getTotalSentByUser(user);
        BigDecimal totalReceived = transactionRepository.getTotalReceivedByUser(user);
        Wallet wallet = walletRepository.findByUser(user).orElse(null);
        BigDecimal currentBalance = wallet != null ? wallet.getBalance() : BigDecimal.ZERO;

        Map<String, Object> summary = new HashMap<>();
        summary.put("currentBalance", currentBalance);
        summary.put("totalSent", totalSent);
        summary.put("totalReceived", totalReceived);
        return summary;
    }

    public TransactionResponse mapToResponse(Transaction t, User currentUser) {
        TransactionResponse res = new TransactionResponse();
        res.setTransactionId(t.getTransactionId());
        res.setReferenceNumber(t.getReferenceNumber());
        res.setAmount(t.getAmount());
        res.setTransactionType(t.getTransactionType());
        res.setStatus(t.getStatus());
        res.setDescription(t.getDescription());
        res.setTransactionDate(t.getTransactionDate());

        if (t.getSender() != null) {
            res.setSenderId(t.getSender().getUserId());
            res.setSenderName(t.getSender().getName());
            res.setSenderEmail(t.getSender().getEmail());
        }

        if (t.getReceiver() != null) {
            res.setReceiverId(t.getReceiver().getUserId());
            res.setReceiverName(t.getReceiver().getName());
            res.setReceiverEmail(t.getReceiver().getEmail());
        }

        // Determine direction relative to currentUser
        if (currentUser != null) {
            if (t.getTransactionType() == TransactionType.ADD_MONEY) {
                res.setDirection("TOP_UP");
            } else if (t.getSender() != null && t.getSender().getUserId().equals(currentUser.getUserId())) {
                res.setDirection("SENT");
            } else {
                res.setDirection("RECEIVED");
            }
        } else {
            res.setDirection(t.getTransactionType().name());
        }

        return res;
    }
}
