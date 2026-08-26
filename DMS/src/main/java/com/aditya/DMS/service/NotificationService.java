package com.aditya.DMS.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.aditya.DMS.entity.Document;
import com.aditya.DMS.entity.Notification;
import com.aditya.DMS.entity.User;
import com.aditya.DMS.repository.NotificationRepo;

@Service
public class NotificationService {

    private final NotificationRepo notificationRepo;

    public NotificationService(NotificationRepo notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    public Notification create(
            User user,
            String message,
            String type,
            Document document) {

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setDocument(document);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepo.save(notification);
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepo.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepo
                .findByUserAndReadFalseOrderByCreatedAtDesc(user);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepo.findById(id)
                .orElse(null);

        if (notification == null) {
            return null;
        }

        notification.setRead(true);

        return notificationRepo.save(notification);
    }
}