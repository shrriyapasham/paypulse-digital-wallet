package com.wallet.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WalletBalanceResponse {

    private Long walletId;
    private Long userId;
    private BigDecimal balance;
    private LocalDateTime updatedAt;

    public WalletBalanceResponse() {
    }

    public WalletBalanceResponse(Long walletId, Long userId, BigDecimal balance, LocalDateTime updatedAt) {
        this.walletId = walletId;
        this.userId = userId;
        this.balance = balance;
        this.updatedAt = updatedAt;
    }

    public Long getWalletId() {
        return walletId;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
