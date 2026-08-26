package com.aditya.DMS.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aditya.DMS.entity.Document;
import com.aditya.DMS.entity.DocumentPermission;
import com.aditya.DMS.entity.Role;
import com.aditya.DMS.entity.User;

public interface DocumentPermissionRepo
        extends JpaRepository<DocumentPermission, Long> {

    List<DocumentPermission> findByDocument(Document document);

    List<DocumentPermission> findByUser(User user);

    List<DocumentPermission> findByRole(Role role);

    List<DocumentPermission> findByDocumentAndUser(
            Document document,
            User user);

    List<DocumentPermission> findByDocumentAndRole(
            Document document,
            Role role);

    void deleteByDocument(Document document);

    void deleteByDocumentAndUser(
            Document document,
            User user);

    void deleteByDocumentAndRole(
            Document document,
            Role role);
}