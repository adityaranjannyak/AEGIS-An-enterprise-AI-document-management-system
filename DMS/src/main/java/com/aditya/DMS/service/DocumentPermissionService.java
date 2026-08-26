package com.aditya.DMS.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aditya.DMS.entity.Document;
import com.aditya.DMS.entity.DocumentPermission;
import com.aditya.DMS.entity.Role;
import com.aditya.DMS.entity.User;
import com.aditya.DMS.repository.DocumentPermissionRepo;

@Service
public class DocumentPermissionService {
    private final DocumentPermissionRepo permissionRepo;

    public DocumentPermissionService(DocumentPermissionRepo permissionRepo) {
        this.permissionRepo = permissionRepo;
    }

    public DocumentPermission grantUserPermission(Document document, User user, String permission) {
        String normalized = permission.toUpperCase();
        DocumentPermission existing = permissionRepo.findByDocumentAndUser(document, user).stream()
                .filter(item -> normalized.equalsIgnoreCase(item.getPermission()))
                .findFirst().orElse(null);
        if (existing != null) return existing;
        DocumentPermission entity = new DocumentPermission();
        entity.setDocument(document);
        entity.setUser(user);
        entity.setPermission(normalized);
        return permissionRepo.save(entity);
    }

    public DocumentPermission grantRolePermission(Document document, Role role, String permission) {
        String normalized = permission.toUpperCase();
        DocumentPermission existing = permissionRepo.findByDocumentAndRole(document, role).stream()
                .filter(item -> normalized.equalsIgnoreCase(item.getPermission()))
                .findFirst().orElse(null);
        if (existing != null) return existing;
        DocumentPermission entity = new DocumentPermission();
        entity.setDocument(document);
        entity.setRole(role);
        entity.setPermission(normalized);
        return permissionRepo.save(entity);
    }

    public List<DocumentPermission> getDocumentPermissions(Document document) {
        return permissionRepo.findByDocument(document);
    }

    public boolean hasPermission(Document document, User user, String permission) {
        if (document.getOwner() != null && document.getOwner().getId().equals(user.getId())) return true;
        boolean userGrant = permissionRepo.findByDocumentAndUser(document, user).stream()
                .anyMatch(item -> permission.equalsIgnoreCase(item.getPermission()));
        if (userGrant) return true;
        return user.getRole() != null && permissionRepo.findByDocumentAndRole(document, user.getRole()).stream()
                .anyMatch(item -> permission.equalsIgnoreCase(item.getPermission()));
    }

    public DocumentPermission getById(Long id) {
        return permissionRepo.findById(id).orElse(null);
    }

    public void delete(Long id) {
        permissionRepo.deleteById(id);
    }
}
