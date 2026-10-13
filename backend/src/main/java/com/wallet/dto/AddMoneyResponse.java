package com.wallet.dto;

import com.wallet.entity.PaymentMethod;
import com.wallet.entity.TransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AddMoneyResponse {

    private String referenceNumber;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private TransactionStatus status;
    private BigDecimal updatedBalance;
    private LocalDateTime transactionDate;

    public AddMoneyResponse() {
    }

    public AddMoneyResponse(String referenceNumber, BigDecimal amount, PaymentMethod paymentMethod,
                            TransactionStatus status, BigDecimal updatedBalance, LocalDateTime transactionDate) {
        this.referenceNumber = referenceNumber;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.updatedBalance = updatedBalance;
        this.transactionDate = transactionDate;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public BigDecimal getUpdatedBalance() {
        return updatedBalance;
    }

    public void setUpdatedBalance(BigDecimal updatedBalance) {
        this.updatedBalance = updatedBalance;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
}
