package com.wallet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class SendMoneyRequest {

    @NotBlank(message = "Recipient identifier (email or phone) is required")
    private String recipientIdentifier;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be greater than ₹0")
    private BigDecimal amount;

    private String description;

    public SendMoneyRequest() {
    }

    public SendMoneyRequest(String recipientIdentifier, BigDecimal amount, String description) {
        this.recipientIdentifier = recipientIdentifier;
        this.amount = amount;
        this.description = description;
    }

    public String getRecipientIdentifier() {
        return recipientIdentifier;
    }

    public void setRecipientIdentifier(String recipientIdentifier) {
        this.recipientIdentifier = recipientIdentifier;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
