package com.wallet.service;

import com.wallet.dto.AdminDashboardStats;
import com.wallet.dto.AdminUserResponse;
import com.wallet.dto.TransactionResponse;
import com.wallet.entity.*;
import com.wallet.exception.InvalidTransactionException;
import com.wallet.exception.UserNotFoundException;
import com.wallet.repository.TransactionRepository;
import com.wallet.repository.UserRepository;
import com.wallet.repository.WalletRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final TransactionService transactionService;

    public AdminService(UserRepository userRepository,
                        WalletRepository walletRepository,
                        TransactionRepository transactionRepository,
                        NotificationService notificationService,
                        TransactionService transactionService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
        this.transactionService = transactionService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStats() {
        AdminDashboardStats stats = new AdminDashboardStats();

        stats.setTotalUsers(userRepository.count());
        stats.setActiveUsers(userRepository.countByStatus(UserStatus.ACTIVE));
        stats.setBlockedUsers(userRepository.countByStatus(UserStatus.BLOCKED));

        stats.setTotalTransactions(transactionRepository.count());
        stats.setSuccessfulTransactions(transactionRepository.countByStatus(TransactionStatus.SUCCESS));
        stats.setFailedTransactions(transactionRepository.countByStatus(TransactionStatus.FAILED));

        stats.setTotalWalletBalance(walletRepository.getTotalWalletBalance());
        stats.setTotalMoneyTransferred(transactionRepository.getTotalMoneyTransferred());

        return stats;
    }

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getAllUsers(String search, Role role, UserStatus status, Pageable pageable) {
        return userRepository.findUsersFiltered(search, role, status, pageable)
                .map(this::mapToAdminUserResponse);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        return mapToAdminUserResponse(user);
    }

    @Transactional
    public AdminUserResponse blockUser(Long userId, User adminUser) {
        if (adminUser.getUserId().equals(userId)) {
            throw new InvalidTransactionException("Administrators cannot block their own account.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (user.getRole() == Role.ADMIN) {
            throw new InvalidTransactionException("Cannot block another administrator.");
        }

        user.setStatus(UserStatus.BLOCKED);
        User saved = userRepository.save(user);

        notificationService.createNotification(
                user,
                "Your account has been temporarily blocked by System Administrator. Please contact support."
        );

        return mapToAdminUserResponse(saved);
    }

    @Transactional
    public AdminUserResponse unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        user.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(user);

        notificationService.createNotification(
                user,
                "Your account has been unblocked by System Administrator. You can now transact freely."
        );

        return mapToAdminUserResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getAllTransactions(String search, TransactionType type, TransactionStatus status, Pageable pageable) {
        return transactionRepository.findAdminTransactionsFiltered(type, status, search, pageable)
                .map(t -> transactionService.mapToResponse(t, null));
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        Wallet wallet = walletRepository.findByUser(user).orElse(null);
        BigDecimal balance = wallet != null ? wallet.getBalance() : BigDecimal.ZERO;
        Long walletId = wallet != null ? wallet.getWalletId() : null;

        return new AdminUserResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                balance,
                walletId
        );
    }
}
