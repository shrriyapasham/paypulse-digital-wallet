package com.wallet.controller;

import com.wallet.dto.ApiResponse;
import com.wallet.dto.SendMoneyRequest;
import com.wallet.dto.TransactionResponse;
import com.wallet.entity.TransactionStatus;
import com.wallet.entity.TransactionType;
import com.wallet.entity.User;
import com.wallet.service.TransactionService;
import com.wallet.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;

    public TransactionController(TransactionService transactionService, UserService userService) {
        this.transactionService = transactionService;
        this.userService = userService;
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<TransactionResponse>> sendMoney(@Valid @RequestBody SendMoneyRequest request) {
        User sender = userService.getCurrentAuthenticatedUser();
        TransactionResponse response = transactionService.sendMoney(sender, request);
        return ResponseEntity.ok(ApiResponse.success("Money transferred successfully.", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getHistory(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User user = userService.getCurrentAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionResponse> result = transactionService.getTransactionHistory(
                user, type, status, startDate, endDate, minAmount, maxAmount, pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Transaction history retrieved.", result));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getRecent(
            @RequestParam(defaultValue = "5") int limit) {
        User user = userService.getCurrentAuthenticatedUser();
        Pageable pageable = PageRequest.of(0, limit);
        List<TransactionResponse> recent = transactionService.getRecentTransactions(user, pageable);
        return ResponseEntity.ok(ApiResponse.success("Recent transactions retrieved.", recent));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary() {
        User user = userService.getCurrentAuthenticatedUser();
        Map<String, Object> summary = transactionService.getUserSummary(user);
        return ResponseEntity.ok(ApiResponse.success("User transaction summary.", summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(@PathVariable Long id) {
        User user = userService.getCurrentAuthenticatedUser();
        TransactionResponse response = transactionService.getTransactionById(id, user);
        return ResponseEntity.ok(ApiResponse.success("Transaction details retrieved.", response));
    }
}
