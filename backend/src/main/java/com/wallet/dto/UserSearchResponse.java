package com.wallet.dto;

public class UserSearchResponse {

    private Long userId;
    private String name;
    private String maskedEmail;
    private String maskedPhone;

    public UserSearchResponse() {
    }

    public UserSearchResponse(Long userId, String name, String maskedEmail, String maskedPhone) {
        this.userId = userId;
        this.name = name;
        this.maskedEmail = maskedEmail;
        this.maskedPhone = maskedPhone;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMaskedEmail() {
        return maskedEmail;
    }

    public void setMaskedEmail(String maskedEmail) {
        this.maskedEmail = maskedEmail;
    }

    public String getMaskedPhone() {
        return maskedPhone;
    }

    public void setMaskedPhone(String maskedPhone) {
        this.maskedPhone = maskedPhone;
    }
}
