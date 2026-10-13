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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       WalletRepository walletRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new DuplicateUserException("Email already registered: " + request.getEmail());
        }

        if (userRepository.existsByPhone(request.getPhone().trim())) {
            throw new DuplicateUserException("Phone number already registered: " + request.getPhone());
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhone(request.getPhone().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        // Automatically create wallet with 0 balance
        Wallet wallet = new Wallet(savedUser, BigDecimal.ZERO);
        walletRepository.save(wallet);
        savedUser.setWallet(wallet);

        // Notification
        notificationService.createNotification(savedUser, "Welcome to Digital Wallet! Your account and wallet have been created successfully.");

        // Authenticate & generate token so user can be immediately logged in
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtUtils.generateTokenFromUserDetails(userDetails);

        return new AuthResponse(
                token,
                savedUser.getUserId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole(),
                savedUser.getStatus()
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new UserBlockedException("Your account has been blocked by administrator. Please contact support.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtils.generateToken(authentication);

        // Login notification
        notificationService.createNotification(user, "Successful login to your digital wallet account.");

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus()
        );
    }
}
