package com.wallet.service;

import com.wallet.dto.AuthResponse;
import com.wallet.dto.LoginRequest;
import com.wallet.dto.RegisterRequest;
import com.wallet.entity.Role;
import com.wallet.entity.User;
import com.wallet.entity.UserStatus;
import com.wallet.entity.Wallet;
import com.wallet.exception.DuplicateUserException;
import com.wallet.exception.UserBlockedException;
import com.wallet.exception.UserNotFoundException;
import com.wallet.repository.UserRepository;
import com.wallet.repository.WalletRepository;
import com.wallet.security.CustomUserDetails;
import com.wallet.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Rahul Sharma", "user1@wallet.com", "+919876543210", "encodedPass", Role.USER, UserStatus.ACTIVE);
        sampleUser.setUserId(1L);
    }

    @Test
    @DisplayName("Should successfully register a new user and create an initial wallet")
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("Rahul Sharma", "user1@wallet.com", "+919876543210", "password123");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setUserId(1L);
            return u;
        });
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtUtils.generateTokenFromUserDetails(any(CustomUserDetails.class))).thenReturn("fake-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("user1@wallet.com", response.getEmail());
        assertEquals("Rahul Sharma", response.getName());
        assertEquals(Role.USER, response.getRole());
        verify(walletRepository, times(1)).save(any(Wallet.class));
        verify(notificationService, times(1)).createNotification(any(User.class), anyString());
    }

    @Test
    @DisplayName("Should throw DuplicateUserException when registering with duplicate email")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Rahul Sharma", "user1@wallet.com", "+919876543210", "password123");
        when(userRepository.existsByEmail("user1@wallet.com")).thenReturn(true);

        assertThrows(DuplicateUserException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login an active user and return JWT")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("user1@wallet.com", "password123");
        Authentication auth = mock(Authentication.class);

        when(userRepository.findByEmail("user1@wallet.com")).thenReturn(Optional.of(sampleUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtils.generateToken(auth)).thenReturn("mocked-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("user1@wallet.com", response.getEmail());
    }

    @Test
    @DisplayName("Should throw UserBlockedException when a blocked user attempts login")
    void testLoginBlockedUser() {
        sampleUser.setStatus(UserStatus.BLOCKED);
        LoginRequest request = new LoginRequest("user1@wallet.com", "password123");

        when(userRepository.findByEmail("user1@wallet.com")).thenReturn(Optional.of(sampleUser));

        assertThrows(UserBlockedException.class, () -> authService.login(request));
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("Should throw BadCredentialsException on invalid credentials")
    void testLoginInvalidCredentials() {
        LoginRequest request = new LoginRequest("user1@wallet.com", "wrongpass");

        when(userRepository.findByEmail("user1@wallet.com")).thenReturn(Optional.of(sampleUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}
