package com.aditya.DMS.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aditya.DMS.entity.Notification;
import com.aditya.DMS.entity.User;

public interface NotificationRepo extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);
}