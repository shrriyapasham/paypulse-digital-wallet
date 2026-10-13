package com.wallet.controller;

import com.wallet.dto.AddMoneyRequest;
import com.wallet.dto.AddMoneyResponse;
import com.wallet.dto.ApiResponse;
import com.wallet.dto.WalletBalanceResponse;
import com.wallet.entity.User;
import com.wallet.entity.WalletTopup;
import com.wallet.service.UserService;
import com.wallet.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;
    private final UserService userService;

    public WalletController(WalletService walletService, UserService userService) {
        this.walletService = walletService;
        this.userService = userService;
    }

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<WalletBalanceResponse>> getBalance() {
        User user = userService.getCurrentAuthenticatedUser();
        WalletBalanceResponse balance = walletService.getWalletBalance(user);
        return ResponseEntity.ok(ApiResponse.success("Wallet balance retrieved successfully.", balance));
    }

    @PostMapping("/add-money")
    public ResponseEntity<ApiResponse<AddMoneyResponse>> addMoney(@Valid @RequestBody AddMoneyRequest request) {
        User user = userService.getCurrentAuthenticatedUser();
        AddMoneyResponse response = walletService.addMoney(user, request);
        return ResponseEntity.ok(ApiResponse.success("Money added to wallet successfully.", response));
    }

    @GetMapping("/topups")
    public ResponseEntity<ApiResponse<List<WalletTopup>>> getTopups() {
        User user = userService.getCurrentAuthenticatedUser();
        List<WalletTopup> topups = walletService.getUserTopups(user);
        return ResponseEntity.ok(ApiResponse.success("Wallet top-up history retrieved.", topups));
    }
}
