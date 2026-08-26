package com.aditya.DMS.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.aditya.DMS.entity.Document;
import com.aditya.DMS.entity.DocumentPermission;
import com.aditya.DMS.entity.Role;
import com.aditya.DMS.entity.User;
import com.aditya.DMS.repository.DocumentRepo;
import com.aditya.DMS.repository.RoleRepo;
import com.aditya.DMS.repository.UserRepo;
import com.aditya.DMS.service.DocumentPermissionService;

@RestController
@RequestMapping("/documents")
@PreAuthorize("isAuthenticated()")
public class PermissionController {
    private static final Set<String> ALL_PERMISSIONS = Set.of("READ", "DOWNLOAD", "EDIT", "DELETE", "SHARE");
    private static final Set<String> EMPLOYEE_PERMISSIONS = Set.of("READ", "DOWNLOAD");

    private final DocumentRepo documentRepo;
    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final DocumentPermissionService permissionService;

    public PermissionController(DocumentRepo documentRepo, UserRepo userRepo, RoleRepo roleRepo, DocumentPermissionService permissionService) {
        this.documentRepo = documentRepo;
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.permissionService = permissionService;
    }

    @GetMapping("/{documentId}/permissions")
    public ResponseEntity<List<DocumentPermission>> getPermissions(@PathVariable Long documentId, Authentication authentication) {
        Document document = documentRepo.findById(documentId).orElse(null);
        if (document == null) return ResponseEntity.notFound().build();
        requireReadableDocument(document, authentication);
        return ResponseEntity.ok(permissionService.getDocumentPermissions(document));
    }

    @PostMapping("/{documentId}/permissions/user")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DocumentPermission> grantUserPermission(@PathVariable Long documentId, @RequestParam Long userId, @RequestParam String permission, Authentication authentication) {
        Document document = documentRepo.findById(documentId).orElse(null);
        User user = userRepo.findById(userId).orElse(null);
        if (document == null || user == null) return ResponseEntity.notFound().build();
        requireManageableDocument(document, authentication);
        String normalized = validatePermissions(user, List.of(permission)).get(0);
        return ResponseEntity.ok(permissionService.grantUserPermission(document, user, normalized));
    }

    @PostMapping("/{documentId}/permissions/role")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DocumentPermission> grantRolePermission(@PathVariable Long documentId, @RequestParam Long roleId, @RequestParam String permission, Authentication authentication) {
        Document document = documentRepo.findById(documentId).orElse(null);
        Role role = roleRepo.findById(roleId).orElse(null);
        if (document == null || role == null) return ResponseEntity.notFound().build();
        requireManageableDocument(document, authentication);
        String normalized = validatePermissions(role, List.of(permission)).get(0);
        return ResponseEntity.ok(permissionService.grantRolePermission(document, role, normalized));
    }

    @PutMapping("/{documentId}/permissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<DocumentPermission>> replacePermissions(@PathVariable Long documentId, @RequestBody PermissionUpdateRequest request, Authentication authentication) {
        Document document = documentRepo.findById(documentId).orElse(null);
        if (document == null) return ResponseEntity.notFound().build();
        requireManageableDocument(document, authentication);

        // Validate the complete request before mutating persisted grants.
        for (UserPermissionGrant grant : request.getUsers()) {
            User user = grant.getUserId() == null ? null : userRepo.findById(grant.getUserId()).orElse(null);
            if (user != null) validatePermissions(user, grant.getPermissions());
        }
        for (RolePermissionGrant grant : request.getRoles()) {
            if (grant.getRole() == null) continue;
            Role role = grant.getRole() == null ? null : roleRepo.findAll().stream().filter(item -> item.getName().equalsIgnoreCase(grant.getRole())).findFirst().orElse(null);
            if (role != null) validatePermissions(role, grant.getPermissions());
        }

        for (DocumentPermission existing : permissionService.getDocumentPermissions(document)) permissionService.delete(existing.getId());
        List<DocumentPermission> saved = new ArrayList<>();

        for (UserPermissionGrant grant : request.getUsers()) {
            User user = grant.getUserId() == null ? null : userRepo.findById(grant.getUserId()).orElse(null);
            if (user == null) continue;
            for (String permission : validatePermissions(user, grant.getPermissions())) saved.add(permissionService.grantUserPermission(document, user, permission));
        }
        for (RolePermissionGrant grant : request.getRoles()) {
            Role role = grant.getRole() == null ? null : roleRepo.findAll().stream().filter(item -> item.getName().equalsIgnoreCase(grant.getRole())).findFirst().orElse(null);
            if (role == null) continue;
            for (String permission : validatePermissions(role, grant.getPermissions())) saved.add(permissionService.grantRolePermission(document, role, permission));
        }
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/permissions/{permissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> revokePermission(@PathVariable Long permissionId, Authentication authentication) {
        DocumentPermission permission = permissionService.getById(permissionId);
        if (permission == null) return ResponseEntity.notFound().build();
        requireManageableDocument(permission.getDocument(), authentication);
        permissionService.delete(permissionId);
        return ResponseEntity.noContent().build();
    }

    private List<String> validatePermissions(User user, List<String> permissions) {
        return validatePermissions(user.getRole(), permissions);
    }

    private List<String> validatePermissions(Role role, List<String> permissions) {
        List<String> normalized = permissions == null ? List.of() : permissions.stream().filter(item -> item != null && !item.isBlank()).map(item -> item.trim().toUpperCase(Locale.ROOT)).distinct().toList();
        Set<String> allowed = role != null && "EMPLOYEE".equalsIgnoreCase(role.getName()) ? EMPLOYEE_PERMISSIONS : ALL_PERMISSIONS;
        if (normalized.stream().anyMatch(item -> !allowed.contains(item))) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "The selected role cannot receive one or more requested permissions.");
        return normalized;
    }

    private void requireReadableDocument(Document document, Authentication authentication) {
        User currentUser = userRepo.findByUsername(authentication.getName());
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = currentUser != null && document.getOwner() != null && document.getOwner().getId().equals(currentUser.getId());
        boolean canRead = currentUser != null && permissionService.hasPermission(document, currentUser, "READ");
        if (!isAdmin && !isOwner && !canRead) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this document.");
    }

    private void requireManageableDocument(Document document, Authentication authentication) {
        User currentUser = userRepo.findByUsername(authentication.getName());
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = currentUser != null && document.getOwner() != null && document.getOwner().getId().equals(currentUser.getId());
        if (!isAdmin && !isOwner) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can manage permissions only for documents you own.");
    }

    public static class PermissionUpdateRequest {
        private List<UserPermissionGrant> users = List.of();
        private List<RolePermissionGrant> roles = List.of();
        public List<UserPermissionGrant> getUsers() { return users == null ? List.of() : users; }
        public void setUsers(List<UserPermissionGrant> users) { this.users = users; }
        public List<RolePermissionGrant> getRoles() { return roles == null ? List.of() : roles; }
        public void setRoles(List<RolePermissionGrant> roles) { this.roles = roles; }
    }

    public static class UserPermissionGrant {
        private Long userId;
        private String permission;
        private List<String> permissions = List.of();
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getPermission() { return permission; }
        public void setPermission(String permission) { this.permission = permission; }
        public List<String> getPermissions() { return permissions != null && !permissions.isEmpty() ? permissions : (permission == null ? List.of() : List.of(permission)); }
        public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    }

    public static class RolePermissionGrant {
        private String role;
        private String permission;
        private List<String> permissions = List.of();
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getPermission() { return permission; }
        public void setPermission(String permission) { this.permission = permission; }
        public List<String> getPermissions() { return permissions != null && !permissions.isEmpty() ? permissions : (permission == null ? List.of() : List.of(permission)); }
        public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    }
}
