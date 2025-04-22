package com.app.socialmedia.repository;

import com.app.socialmedia.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByTimeStampDesc(long userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByTimeStampDesc(long userId);
    long countByUserIdAndIsReadFalse(long userId);
} 