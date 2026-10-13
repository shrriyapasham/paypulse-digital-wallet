package com.wallet.controller;

import com.wallet.dto.AdminDashboardStats;
import com.wallet.dto.AdminUserResponse;
import com.wallet.dto.ApiResponse;
import com.wallet.dto.TransactionResponse;
import com.wallet.entity.Role;
import com.wallet.entity.TransactionStatus;
import com.wallet.entity.TransactionType;
import com.wallet.entity.User;
import com.wallet.entity.UserStatus;
import com.wallet.service.AdminService;
import com.wallet.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    public AdminController(AdminService adminService, UserService userService) {
        this.adminService = adminService;
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getDashboardStats() {
        AdminDashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard statistics retrieved.", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AdminUserResponse> users = adminService.getAllUsers(search, role, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully.", users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable Long id) {
        AdminUserResponse user = adminService.getUserDetails(id);
        return ResponseEntity.ok(ApiResponse.success("User details retrieved.", user));
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse<AdminUserResponse>> blockUser(@PathVariable Long id) {
        User adminUser = userService.getCurrentAuthenticatedUser();
        AdminUserResponse response = adminService.blockUser(id, adminUser);
        return ResponseEntity.ok(ApiResponse.success("User blocked successfully.", response));
    }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<ApiResponse<AdminUserResponse>> unblockUser(@PathVariable Long id) {
        AdminUserResponse response = adminService.unblockUser(id);
        return ResponseEntity.ok(ApiResponse.success("User unblocked successfully.", response));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionResponse> transactions = adminService.getAllTransactions(search, type, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin transactions retrieved.", transactions));
    }
}
