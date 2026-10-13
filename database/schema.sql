-- =====================================================================
-- DIGITAL WALLET AND TRANSACTION MANAGEMENT SYSTEM
-- Database Schema Script (MySQL 8.0+ / MySQL Workbench Compatible)
-- =====================================================================

DROP DATABASE IF EXISTS digital_wallet_db;
CREATE DATABASE digital_wallet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE digital_wallet_db;

-- 1. USERS TABLE
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. WALLETS TABLE (1-to-1 with users)
CREATE TABLE wallets (
    wallet_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_wallet_balance_positive CHECK (balance >= 0.00)
) ENGINE=InnoDB;

-- 3. TRANSACTIONS TABLE
CREATE TABLE transactions (
    transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NULL,
    receiver_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type ENUM('ADD_MONEY', 'TRANSFER', 'REFUND') NOT NULL,
    status ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL,
    reference_number VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_txn_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_txn_receiver FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_txn_sender (sender_id),
    INDEX idx_txn_receiver (receiver_id),
    INDEX idx_txn_ref (reference_number),
    INDEX idx_txn_date (transaction_date),
    INDEX idx_txn_status (status)
) ENGINE=InnoDB;

-- 4. WALLET_TOPUPS TABLE (Simulated Payment Records)
CREATE TABLE wallet_topups (
    topup_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method ENUM('UPI', 'CARD', 'NET_BANKING') NOT NULL,
    status ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_topup_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_topup_user (user_id),
    INDEX idx_topup_status (status)
) ENGINE=InnoDB;

-- 5. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_is_read (is_read)
) ENGINE=InnoDB;

-- =====================================================================
-- INITIAL SEED DATA FOR DEMO & TESTING
-- Password for all seed users is: password123
-- BCrypt hash: $2a$10$wE4j7gQ1h6lKqW8wD1o5eeI3fN5s8jB0mC6uH.hN5rQ4tO7xX3w3q
-- (Generated using standard BCrypt strength 10)
-- Note: Spring Boot DataInitializer also verifies/seeds these if missing.
-- =====================================================================

-- Passwords below are BCrypt for 'password123':
-- $2a$10$kPz3.vFzOQ5YIhzfFh7xMeT7Qc0qW6e/pQ/K29B6xJkE0YJ7K5oW6
INSERT INTO users (user_id, name, email, phone, password, role, status, created_at) VALUES
(1, 'System Administrator', 'admin@wallet.com', '+919999900000', '$2a$10$7vN34hFk7NcmjH5jC0z8zOPb13RzK6P5K5mF3.Rk0YqA2jFhJ5u.e', 'ADMIN', 'ACTIVE', NOW() - INTERVAL 10 DAY),
(2, 'Rahul Sharma', 'user1@wallet.com', '+919876543210', '$2a$10$7vN34hFk7NcmjH5jC0z8zOPb13RzK6P5K5mF3.Rk0YqA2jFhJ5u.e', 'USER', 'ACTIVE', NOW() - INTERVAL 9 DAY),
(3, 'Priya Patel', 'user2@wallet.com', '+919876543211', '$2a$10$7vN34hFk7NcmjH5jC0z8zOPb13RzK6P5K5mF3.Rk0YqA2jFhJ5u.e', 'USER', 'ACTIVE', NOW() - INTERVAL 8 DAY),
(4, 'Amit Verma', 'amit@wallet.com', '+919876543212', '$2a$10$7vN34hFk7NcmjH5jC0z8zOPb13RzK6P5K5mF3.Rk0YqA2jFhJ5u.e', 'USER', 'ACTIVE', NOW() - INTERVAL 7 DAY),
(5, 'Sneha Reddy', 'sneha@wallet.com', '+919876543213', '$2a$10$7vN34hFk7NcmjH5jC0z8zOPb13RzK6P5K5mF3.Rk0YqA2jFhJ5u.e', 'USER', 'BLOCKED', NOW() - INTERVAL 6 DAY);

-- Seed Wallets
INSERT INTO wallets (wallet_id, user_id, balance, created_at, updated_at) VALUES
(1, 1, 0.00, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY),
(2, 2, 7500.00, NOW() - INTERVAL 9 DAY, NOW()),
(3, 3, 4200.00, NOW() - INTERVAL 8 DAY, NOW()),
(4, 4, 1500.00, NOW() - INTERVAL 7 DAY, NOW()),
(5, 5, 0.00, NOW() - INTERVAL 6 DAY, NOW());

-- Seed Topups
INSERT INTO wallet_topups (topup_id, user_id, amount, payment_method, status, created_at) VALUES
(1, 2, 10000.00, 'UPI', 'SUCCESS', NOW() - INTERVAL 5 DAY),
(2, 3, 5000.00, 'CARD', 'SUCCESS', NOW() - INTERVAL 4 DAY),
(3, 4, 2000.00, 'NET_BANKING', 'SUCCESS', NOW() - INTERVAL 3 DAY);

-- Seed Transactions
INSERT INTO transactions (transaction_id, sender_id, receiver_id, amount, transaction_type, status, reference_number, description, transaction_date) VALUES
(1, NULL, 2, 10000.00, 'ADD_MONEY', 'SUCCESS', 'TXN20261001100101', 'Wallet top-up via UPI', NOW() - INTERVAL 5 DAY),
(2, NULL, 3, 5000.00, 'ADD_MONEY', 'SUCCESS', 'TXN20261002100202', 'Wallet top-up via CARD', NOW() - INTERVAL 4 DAY),
(3, 2, 3, 1500.00, 'TRANSFER', 'SUCCESS', 'TXN20261003100303', 'Payment for group lunch', NOW() - INTERVAL 3 DAY),
(4, 2, 4, 500.00, 'TRANSFER', 'SUCCESS', 'TXN20261004100404', 'Book share fee', NOW() - INTERVAL 2 DAY),
(5, 3, 2, 700.00, 'TRANSFER', 'SUCCESS', 'TXN20261005100505', 'Reimbursement for tickets', NOW() - INTERVAL 1 DAY),
(6, NULL, 4, 2000.00, 'ADD_MONEY', 'SUCCESS', 'TXN20261006100606', 'Wallet top-up via NET_BANKING', NOW() - INTERVAL 1 DAY);

-- Seed Notifications
INSERT INTO notifications (notification_id, user_id, message, is_read, created_at) VALUES
(1, 2, 'Welcome to Digital Wallet! Your account has been registered.', TRUE, NOW() - INTERVAL 9 DAY),
(2, 2, 'Wallet credited with ₹10000.00 via UPI.', TRUE, NOW() - INTERVAL 5 DAY),
(3, 2, 'You sent ₹1500.00 to Priya Patel.', TRUE, NOW() - INTERVAL 3 DAY),
(4, 3, 'You received ₹1500.00 from Rahul Sharma.', TRUE, NOW() - INTERVAL 3 DAY),
(5, 2, 'You received ₹700.00 from Priya Patel.', FALSE, NOW() - INTERVAL 1 DAY),
(6, 5, 'Your account has been temporarily blocked by Administrator.', FALSE, NOW() - INTERVAL 6 DAY);
