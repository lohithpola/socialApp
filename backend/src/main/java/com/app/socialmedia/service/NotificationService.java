package com.app.socialmedia.service;

import com.app.socialmedia.model.Notification;
import com.app.socialmedia.model.Users;
import com.app.socialmedia.repository.NotificationRepo;
import com.app.socialmedia.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepo notificationRepo;

    private final UserRepo userRepo;

    public Notification createNotification(String type, String content, Users user) {
        Notification notification = new Notification();
        notification.setType(type);
        notification.setContent(content);
        notification.setTimeStamp(new Date());
        notification.setRead(false);
        notification.setUser(user);
        return notificationRepo.save(notification);
    }
    
    public List<Notification> getUserNotifications(long userId) {
        return notificationRepo.findByUserIdOrderByTimeStampDesc(userId);
    }
    
    public List<Notification> getUnreadNotifications(long userId) {
        return notificationRepo.findByUserIdAndIsReadFalseOrderByTimeStampDesc(userId);
    }
    
    public long getUnreadCount(long userId) {
        return notificationRepo.countByUserIdAndIsReadFalse(userId);
    }
    
    public void markAsRead(long notificationId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepo.save(notification);
    }
    
    public void markAllAsRead(long userId) {
        List<Notification> notifications = notificationRepo.findByUserIdAndIsReadFalseOrderByTimeStampDesc(userId);
        for (Notification notification : notifications) {
            notification.setRead(true);
            notificationRepo.save(notification);
        }
    }
} 