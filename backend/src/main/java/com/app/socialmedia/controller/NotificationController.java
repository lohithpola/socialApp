package com.app.socialmedia.controller;

import com.app.socialmedia.model.Notification;
import com.app.socialmedia.model.Users;
import com.app.socialmedia.service.JWTService;
import com.app.socialmedia.service.NotificationService;
import com.app.socialmedia.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class NotificationController {


    private final NotificationService notificationService;

    private final UserService userService;

    private final JWTService jwtService;

    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String username = jwtService.extractUserName(jwt);
        Users user = userService.getUserByUserName(username);
        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/notifications/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String username = jwtService.extractUserName(jwt);
        Users user = userService.getUserByUserName(username);
        List<Notification> notifications = notificationService.getUnreadNotifications(user.getId());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/notifications/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String username = jwtService.extractUserName(jwt);
        Users user = userService.getUserByUserName(username);
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String username = jwtService.extractUserName(jwt);
        Users user = userService.getUserByUserName(username);
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    // Method to create and send notification via WebSocket
    public void createAndSendNotification(String type, String content, Users user) {
        Notification notification = notificationService.createNotification(type, content, user);
        // Send to WebSocket topic
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), notification);
    }
} 