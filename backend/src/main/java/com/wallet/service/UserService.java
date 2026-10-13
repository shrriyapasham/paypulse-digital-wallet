package com.wallet.service;

import com.wallet.dto.ChangePasswordRequest;
import com.wallet.dto.UserProfileResponse;
import com.wallet.dto.UserSearchResponse;
import com.wallet.entity.User;
import com.wallet.entity.Wallet;
import com.wallet.exception.InvalidTransactionException;
import com.wallet.exception.UserNotFoundException;
import com.wallet.repository.UserRepository;
import com.wallet.repository.WalletRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository,
                       WalletRepository walletRepository,
                       PasswordEncoder passwordEncoder,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UserNotFoundException("No authenticated user found in session.");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(User user) {
        Wallet wallet = walletRepository.findByUser(user).orElse(null);
        BigDecimal balance = wallet != null ? wallet.getBalance() : BigDecimal.ZERO;
        Long walletId = wallet != null ? wallet.getWalletId() : null;

        return new UserProfileResponse(
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

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidTransactionException("Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        notificationService.createNotification(user, "Your account password was successfully updated.");
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponse> searchActiveUsers(String query, User currentUser) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        List<User> matchedUsers = userRepository.searchActiveUsers(query.trim(), currentUser.getUserId());

        return matchedUsers.stream()
                .map(u -> new UserSearchResponse(
                        u.getUserId(),
                        u.getName(),
                        maskEmail(u.getEmail()),
                        maskPhone(u.getPhone())
                ))
                .collect(Collectors.toList());
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int atIndex = email.indexOf("@");
        String username = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        if (username.length() <= 2) {
            return username.charAt(0) + "*" + domain;
        }
        return username.substring(0, 2) + "***" + domain;
    }

    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 6) return phone;
        int len = phone.length();
        return phone.substring(0, 4) + "*****" + phone.substring(len - 2);
    }
}
