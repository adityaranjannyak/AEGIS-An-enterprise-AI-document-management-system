package com.aditya.DMS.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aditya.DMS.entity.Activity;
import com.aditya.DMS.entity.Document;
import com.aditya.DMS.entity.User;
import com.aditya.DMS.repository.DocumentRepo;
import com.aditya.DMS.repository.UserRepo;
import com.aditya.DMS.service.ActivityService;
import com.aditya.DMS.service.DocumentService;

@RestController
@RequestMapping("/activities")
@PreAuthorize("isAuthenticated()")
public class ActivityController {

    private final ActivityService activityService;
    private final UserRepo userRepo;
    private final DocumentRepo documentRepo;
    private final DocumentService documentService;

    public ActivityController(
            ActivityService activityService,
            UserRepo userRepo,
            DocumentRepo documentRepo,
            DocumentService documentService) {

        this.activityService = activityService;
        this.userRepo = userRepo;
        this.documentRepo = documentRepo;
        this.documentService = documentService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<Activity>> getMyActivities(
            Authentication authentication) {

        User user = userRepo.findByUsername(
                authentication.getName());

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                activityService.getActivitiesByUser(user));
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<List<Activity>> getDocumentActivities(
            @PathVariable Long documentId,
            Authentication authentication) {

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a ->
                        a.getAuthority()
                                .equals("ROLE_ADMIN"));

        Document document = documentRepo.findById(documentId)
                .orElse(null);

        if (document == null) {
            return ResponseEntity.notFound().build();
        }

        Document accessible =
                documentService.getDocumentForUser(
                        documentId,
                        authentication.getName(),
                        isAdmin);

        if (accessible == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                activityService.getActivitiesByDocument(document));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Activity> getAllActivities() {
        return activityService.getAllActivities();
    }
}