package com.wallet.controller;

import com.wallet.dto.ApiResponse;
import com.wallet.dto.ChangePasswordRequest;
import com.wallet.dto.UserProfileResponse;
import com.wallet.dto.UserSearchResponse;
import com.wallet.entity.User;
import com.wallet.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile() {
        User user = userService.getCurrentAuthenticatedUser();
        UserProfileResponse profile = userService.getUserProfile(user);
        return ResponseEntity.ok(ApiResponse.success("User profile fetched successfully.", profile));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = userService.getCurrentAuthenticatedUser();
        userService.changePassword(user, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully."));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserSearchResponse>>> searchUsers(@RequestParam("q") String query) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        List<UserSearchResponse> results = userService.searchActiveUsers(query, currentUser);
        return ResponseEntity.ok(ApiResponse.success("User search results.", results));
    }
}
