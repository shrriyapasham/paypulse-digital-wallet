package com.wallet.config;

import com.wallet.entity.*;
import com.wallet.repository.NotificationRepository;
import com.wallet.repository.TransactionRepository;
import com.wallet.repository.UserRepository;
import com.wallet.repository.WalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            WalletRepository walletRepository,
            TransactionRepository transactionRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        // =========================================================
        // ADMIN USER
        // =========================================================

        User admin = userRepository.findByEmail("admin@wallet.com").orElse(null);

        if (admin == null) {

            logger.info("Initializing Admin user...");

            admin = new User(
                    "System Administrator",
                    "admin@wallet.com",
                    "+919999900000",
                    passwordEncoder.encode("password123"),
                    Role.ADMIN,
                    UserStatus.ACTIVE
            );

            admin = userRepository.save(admin);

            Wallet adminWallet = new Wallet(
                    admin,
                    BigDecimal.ZERO
            );

            walletRepository.save(adminWallet);
            admin.setWallet(adminWallet);

        } else {

            // Reset demo admin password
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setStatus(UserStatus.ACTIVE);
            userRepository.save(admin);

            logger.info("Admin demo password reset successfully.");
        }


        // =========================================================
        // USER 1 - RAHUL
        // =========================================================

        User user1 = userRepository
                .findByEmail("user1@wallet.com")
                .orElse(null);

        if (user1 == null) {

            logger.info("Initializing User 1 (Rahul Sharma)...");

            user1 = new User(
                    "Rahul Sharma",
                    "user1@wallet.com",
                    "+919876543210",
                    passwordEncoder.encode("password123"),
                    Role.USER,
                    UserStatus.ACTIVE
            );

            user1 = userRepository.save(user1);

            Wallet wallet1 = new Wallet(
                    user1,
                    new BigDecimal("7500.00")
            );

            walletRepository.save(wallet1);
            user1.setWallet(wallet1);

            notificationRepository.save(
                    new Notification(
                            user1,
                            "Welcome to Digital Wallet! Your initial balance is ₹7,500.00."
                    )
            );

        } else {

            // Reset demo User 1 password
            user1.setPassword(passwordEncoder.encode("password123"));
            user1.setStatus(UserStatus.ACTIVE);
            userRepository.save(user1);

            logger.info("User 1 demo password reset successfully.");
        }


        // =========================================================
        // USER 2 - PRIYA
        // =========================================================

        User user2 = userRepository
                .findByEmail("user2@wallet.com")
                .orElse(null);

        if (user2 == null) {

            logger.info("Initializing User 2 (Priya Patel)...");

            user2 = new User(
                    "Priya Patel",
                    "user2@wallet.com",
                    "+919876543211",
                    passwordEncoder.encode("password123"),
                    Role.USER,
                    UserStatus.ACTIVE
            );

            user2 = userRepository.save(user2);

            Wallet wallet2 = new Wallet(
                    user2,
                    new BigDecimal("4200.00")
            );

            walletRepository.save(wallet2);
            user2.setWallet(wallet2);

            notificationRepository.save(
                    new Notification(
                            user2,
                            "Welcome to Digital Wallet! Your initial balance is ₹4,200.00."
                    )
            );

        } else {

            // Reset demo User 2 password
            user2.setPassword(passwordEncoder.encode("password123"));
            user2.setStatus(UserStatus.ACTIVE);
            userRepository.save(user2);

            logger.info("User 2 demo password reset successfully.");
        }


        // =========================================================
        // SAMPLE TRANSACTIONS
        // =========================================================

        if (transactionRepository.count() == 0
                && user1 != null
                && user2 != null) {

            logger.info("Initializing sample transactions...");

            Transaction topup1 = new Transaction(
                    null,
                    user1,
                    new BigDecimal("10000.00"),
                    TransactionType.ADD_MONEY,
                    TransactionStatus.SUCCESS,
                    "TXN20261001100101",
                    "Initial wallet top-up via UPI"
            );

            transactionRepository.save(topup1);


            Transaction transfer1 = new Transaction(
                    user1,
                    user2,
                    new BigDecimal("2500.00"),
                    TransactionType.TRANSFER,
                    TransactionStatus.SUCCESS,
                    "TXN20261003100303",
                    "Project team expense share"
            );

            transactionRepository.save(transfer1);
        }


        // =========================================================
        // INITIALIZATION COMPLETE
        // =========================================================

        logger.info("Data initialization check completed successfully.");
    }
}