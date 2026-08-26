package com.aditya.DMS.controller;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.aditya.DMS.entity.Document;
import com.aditya.DMS.service.DocumentService;

@RestController
@PreAuthorize("isAuthenticated()")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/documents/upload")
    public Document uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication authentication)
            throws IOException {

        return documentService.uploadDocument(
                file,
                authentication.getName());
    }

    @GetMapping("/documents")
    public List<Document> getDocuments(
            Authentication authentication) {

        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_ADMIN"));

        return documentService.getDocumentsForUser(
                authentication.getName(),
                isAdmin);
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<Document> getDocumentById(
            @PathVariable Long id,
            Authentication authentication) {

        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_ADMIN"));

        Document document =
                documentService.getDocumentForUser(
                        id,
                        authentication.getName(),
                        isAdmin);

        if (document == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(document);
    }

    @GetMapping("/documents/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            Authentication authentication)
            throws IOException {

        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_ADMIN"));

        boolean canDownload =
                documentService.canDownload(
                        id,
                        authentication.getName(),
                        isAdmin);

        if (!canDownload) {
            return ResponseEntity.notFound().build();
        }

        Document document =
                documentService.getDocumentForUser(
                        id,
                        authentication.getName(),
                        isAdmin);

        if (document == null) {
            return ResponseEntity.notFound().build();
        }

        Path path =
                Paths.get(document.getFilePath());

        Resource resource =
                new UrlResource(path.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        documentService.logDownload(
                id,
                authentication.getName(),
                isAdmin);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\""
                                + document.getName()
                                + "\"")
                .body(resource);
    }

    @PutMapping("/documents/{id}")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Long id,
            @RequestBody Document document,
            Authentication authentication) {

        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_ADMIN"));

        Document updatedDocument =
                documentService.updateDocument(
                        id,
                        document,
                        authentication.getName(),
                        isAdmin);

        if (updatedDocument == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedDocument);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            Authentication authentication) {

        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_ADMIN"));

        boolean deleted =
                documentService.deleteDocument(
                        id,
                        authentication.getName(),
                        isAdmin);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}