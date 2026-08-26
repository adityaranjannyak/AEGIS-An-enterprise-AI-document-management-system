package com.aditya.DMS.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aditya.DMS.entity.Activity;
import com.aditya.DMS.entity.Document;
import com.aditya.DMS.entity.User;

public interface ActivityRepo extends JpaRepository<Activity, Long> {

    List<Activity> findByUserOrderByTimestampDesc(User user);

    List<Activity> findByDocumentOrderByTimestampDesc(Document document);

    List<Activity> findAllByOrderByTimestampDesc();
}