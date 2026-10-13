package com.wallet.controller;

import com.wallet.dto.ApiResponse;
import com.wallet.dto.NotificationResponse;
import com.wallet.entity.User;
import com.wallet.service.NotificationService;
import com.wallet.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = userService.getCurrentAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> result = notificationService.getUserNotifications(user, pageable);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved.", result));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getRecentNotifications() {
        User user = userService.getCurrentAuthenticatedUser();
        List<NotificationResponse> result = notificationService.getRecentNotifications(user);
        return ResponseEntity.ok(ApiResponse.success("Recent notifications retrieved.", result));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        User user = userService.getCurrentAuthenticatedUser();
        long unread = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(ApiResponse.success("Unread count.", Map.of("unreadCount", unread)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable Long id) {
        User user = userService.getCurrentAuthenticatedUser();
        NotificationResponse response = notificationService.markAsRead(id, user);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read.", response));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = userService.getCurrentAuthenticatedUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read."));
    }
}
