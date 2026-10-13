package com.wallet.service;

import com.wallet.dto.AddMoneyRequest;
import com.wallet.dto.AddMoneyResponse;
import com.wallet.dto.WalletBalanceResponse;
import com.wallet.entity.*;
import com.wallet.exception.InvalidTransactionException;
import com.wallet.exception.UserBlockedException;
import com.wallet.repository.TransactionRepository;
import com.wallet.repository.WalletRepository;
import com.wallet.repository.WalletTopupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTopupRepository walletTopupRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    public WalletService(WalletRepository walletRepository,
                         WalletTopupRepository walletTopupRepository,
                         TransactionRepository transactionRepository,
                         NotificationService notificationService) {
        this.walletRepository = walletRepository;
        this.walletTopupRepository = walletTopupRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public WalletBalanceResponse getWalletBalance(User user) {
        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> {
                    Wallet newWallet = new Wallet(user, BigDecimal.ZERO);
                    return walletRepository.save(newWallet);
                });

        return new WalletBalanceResponse(
                wallet.getWalletId(),
                user.getUserId(),
                wallet.getBalance(),
                wallet.getUpdatedAt()
        );
    }

    @Transactional
    public AddMoneyResponse addMoney(User user, AddMoneyRequest request) {
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new UserBlockedException("Your account is blocked. You cannot add money.");
        }

        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransactionException("Amount must be greater than ₹0.");
        }

        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> new Wallet(user, BigDecimal.ZERO));

        // Generate unique reference number
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String referenceNumber = "TXN" + timestamp + suffix;

        // Update wallet balance
        BigDecimal newBalance = wallet.getBalance().add(amount).setScale(2);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        // Record top-up simulation
        WalletTopup topup = new WalletTopup(
                user,
                amount,
                request.getPaymentMethod(),
                TransactionStatus.SUCCESS
        );
        walletTopupRepository.save(topup);

        // Record transaction
        Transaction transaction = new Transaction(
                null, // No sender for wallet top-up
                user, // Receiver is the user
                amount,
                TransactionType.ADD_MONEY,
                TransactionStatus.SUCCESS,
                referenceNumber,
                "Simulated top-up via " + request.getPaymentMethod()
        );
        transactionRepository.save(transaction);

        // Create notification
        notificationService.createNotification(
                user,
                String.format("₹%.2f credited to your wallet via %s. Ref: %s",
                        amount, request.getPaymentMethod(), referenceNumber)
        );

        return new AddMoneyResponse(
                referenceNumber,
                amount,
                request.getPaymentMethod(),
                TransactionStatus.SUCCESS,
                newBalance,
                transaction.getTransactionDate()
        );
    }

    @Transactional(readOnly = true)
    public List<WalletTopup> getUserTopups(User user) {
        return walletTopupRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
