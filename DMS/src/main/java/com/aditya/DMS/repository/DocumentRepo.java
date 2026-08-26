package com.aditya.DMS.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aditya.DMS.entity.Document;
import com.aditya.DMS.entity.User;

public interface DocumentRepo extends JpaRepository<Document, Long> {

    List<Document> findByOwner(User owner);

    List<Document> findByOwnerOrderByUpdatedAtDesc(User owner);

    List<Document> findAllByOrderByUpdatedAtDesc();
}