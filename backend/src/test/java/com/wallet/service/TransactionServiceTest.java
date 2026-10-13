package com.wallet.service;

import com.wallet.dto.SendMoneyRequest;
import com.wallet.dto.TransactionResponse;
import com.wallet.entity.*;
import com.wallet.exception.InsufficientBalanceException;
import com.wallet.exception.InvalidTransactionException;
import com.wallet.exception.UserBlockedException;
import com.wallet.exception.UserNotFoundException;
import com.wallet.repository.TransactionRepository;
import com.wallet.repository.UserRepository;
import com.wallet.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TransactionService transactionService;

    private User sender;
    private User receiver;
    private Wallet senderWallet;
    private Wallet receiverWallet;

    @BeforeEach
    void setUp() {
        sender = new User("Rahul Sharma", "user1@wallet.com", "+919876543210", "pass", Role.USER, UserStatus.ACTIVE);
        sender.setUserId(1L);

        receiver = new User("Priya Patel", "user2@wallet.com", "+919876543211", "pass", Role.USER, UserStatus.ACTIVE);
        receiver.setUserId(2L);

        senderWallet = new Wallet(sender, new BigDecimal("5000.00"));
        senderWallet.setWalletId(10L);

        receiverWallet = new Wallet(receiver, new BigDecimal("1000.00"));
        receiverWallet.setWalletId(20L);
    }

    @Test
    @DisplayName("Should successfully transfer money between two active users")
    void testSendMoneySuccess() {
        SendMoneyRequest request = new SendMoneyRequest("user2@wallet.com", new BigDecimal("1500.00"), "Project fee");

        when(userRepository.findByEmail("user2@wallet.com")).thenReturn(Optional.of(receiver));
        when(walletRepository.findByUser(sender)).thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByUser(receiver)).thenReturn(Optional.of(receiverWallet));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction t = invocation.getArgument(0);
            t.setTransactionId(100L);
            return t;
        });

        TransactionResponse response = transactionService.sendMoney(sender, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("1500.00"), response.getAmount());
        assertEquals("SENT", response.getDirection());
        assertEquals(new BigDecimal("3500.00"), senderWallet.getBalance());
        assertEquals(new BigDecimal("2500.00"), receiverWallet.getBalance());
        verify(walletRepository, times(1)).save(senderWallet);
        verify(walletRepository, times(1)).save(receiverWallet);
        verify(notificationService, times(2)).createNotification(any(User.class), anyString());
    }

    @Test
    @DisplayName("Should throw InsufficientBalanceException when balance is too low")
    void testSendMoneyInsufficientBalance() {
        SendMoneyRequest request = new SendMoneyRequest("user2@wallet.com", new BigDecimal("6000.00"), "Too high");

        when(userRepository.findByEmail("user2@wallet.com")).thenReturn(Optional.of(receiver));
        when(walletRepository.findByUser(sender)).thenReturn(Optional.of(senderWallet));

        assertThrows(InsufficientBalanceException.class, () -> transactionService.sendMoney(sender, request));
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw InvalidTransactionException when attempting self transfer")
    void testSendMoneySelfTransfer() {
        SendMoneyRequest request = new SendMoneyRequest("user1@wallet.com", new BigDecimal("500.00"), "Self");

        when(userRepository.findByEmail("user1@wallet.com")).thenReturn(Optional.of(sender));

        assertThrows(InvalidTransactionException.class, () -> transactionService.sendMoney(sender, request));
        verify(walletRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw UserBlockedException when recipient is blocked")
    void testSendMoneyRecipientBlocked() {
        receiver.setStatus(UserStatus.BLOCKED);
        SendMoneyRequest request = new SendMoneyRequest("user2@wallet.com", new BigDecimal("500.00"), "Transfer");

        when(userRepository.findByEmail("user2@wallet.com")).thenReturn(Optional.of(receiver));

        assertThrows(UserBlockedException.class, () -> transactionService.sendMoney(sender, request));
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when recipient does not exist")
    void testSendMoneyRecipientNotFound() {
        SendMoneyRequest request = new SendMoneyRequest("unknown@wallet.com", new BigDecimal("500.00"), "Transfer");

        when(userRepository.findByEmail("unknown@wallet.com")).thenReturn(Optional.empty());
        when(userRepository.findByPhone("unknown@wallet.com")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> transactionService.sendMoney(sender, request));
    }

    @Test
    @DisplayName("Should throw InvalidTransactionException when amount is zero or negative")
    void testSendMoneyZeroAmount() {
        SendMoneyRequest request = new SendMoneyRequest("user2@wallet.com", BigDecimal.ZERO, "Transfer");

        assertThrows(InvalidTransactionException.class, () -> transactionService.sendMoney(sender, request));
    }
}
