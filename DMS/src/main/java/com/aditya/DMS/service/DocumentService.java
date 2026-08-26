package com.aditya.DMS.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aditya.DMS.entity.Document;
import com.aditya.DMS.entity.User;
import com.aditya.DMS.repository.DocumentRepo;
import com.aditya.DMS.repository.UserRepo;

@Service
public class DocumentService {

    private final DocumentRepo documentRepo;
    private final UserRepo userRepo;
    private final DocumentPermissionService permissionService;
    private final ActivityService activityService;
    private final RagIngestionService ragIngestionService;

    public DocumentService(
            DocumentRepo documentRepo,
            UserRepo userRepo,
            DocumentPermissionService permissionService,
            ActivityService activityService,
            RagIngestionService ragIngestionService) {

        this.documentRepo = documentRepo;
        this.userRepo = userRepo;
        this.permissionService = permissionService;
        this.activityService = activityService;
        this.ragIngestionService = ragIngestionService;
    }

    public Document uploadDocument(
            MultipartFile file,
            String username) throws IOException {

        User user = userRepo.findByUsername(username);

        if (user == null) {
            throw new RuntimeException("User not found.");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File cannot be empty.");
        }

        Path uploadDirectory =
                Paths.get(System.getProperty("user.dir"), "uploads");

        if (!Files.exists(uploadDirectory)) {
            Files.createDirectories(uploadDirectory);
        }

        Path filePath =
                uploadDirectory.resolve(file.getOriginalFilename());

        file.transferTo(filePath.toFile());

        Document document = new Document();

        document.setName(file.getOriginalFilename());

        /*
         * Keep the database path relative.
         * This preserves compatibility with existing documents.
         */
        document.setFilePath(
                "uploads/" + file.getOriginalFilename()
        );

        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setOwner(user);

        Document savedDocument =
                documentRepo.save(document);

        /*
         * Automatically ingest newly uploaded documents
         * into the RAG system.
         */
        ragIngestionService.ingestDocument(
                savedDocument.getId(),
                filePath
        );

        activityService.log(
                user,
                savedDocument,
                "DOCUMENT_UPLOADED",
                "Uploaded document: "
                        + savedDocument.getName()
        );

        return savedDocument;
    }

    public List<Document> getAllDocuments() {
        return documentRepo.findAllByOrderByUpdatedAtDesc();
    }

    public List<Document> getDocumentsByOwner(
            String username) {

        User user =
                userRepo.findByUsername(username);

        if (user == null) {
            return List.of();
        }

        return documentRepo
                .findByOwnerOrderByUpdatedAtDesc(user);
    }

    public List<Document> getDocumentsForUser(
            String username,
            boolean isAdmin) {

        User user =
                userRepo.findByUsername(username);

        if (user == null) {
            return List.of();
        }

        if (isAdmin) {
            return getAllDocuments();
        }

        List<Document> allDocuments =
                documentRepo.findAll();

        List<Document> accessibleDocuments =
                new ArrayList<>();

        for (Document document : allDocuments) {

            boolean isOwner =
                    document.getOwner() != null
                    && document.getOwner()
                            .getId()
                            .equals(user.getId());

            boolean hasReadPermission =
                    permissionService.hasPermission(
                            document,
                            user,
                            "READ"
                    );

            if (isOwner || hasReadPermission) {
                accessibleDocuments.add(document);
            }
        }

        accessibleDocuments.sort((a, b) -> {

            if (a.getUpdatedAt() == null
                    && b.getUpdatedAt() == null) {
                return 0;
            }

            if (a.getUpdatedAt() == null) {
                return 1;
            }

            if (b.getUpdatedAt() == null) {
                return -1;
            }

            return b.getUpdatedAt()
                    .compareTo(a.getUpdatedAt());
        });

        return accessibleDocuments;
    }

    public Document getDocumentForUser(
            Long id,
            String username,
            boolean isAdmin) {

        Document document =
                documentRepo.findById(id)
                        .orElse(null);

        if (document == null) {
            return null;
        }

        if (isAdmin) {

            logView(document, username);

            return document;
        }

        User user =
                userRepo.findByUsername(username);

        if (user == null) {
            return null;
        }

        boolean isOwner =
                document.getOwner() != null
                && document.getOwner()
                        .getId()
                        .equals(user.getId());

        boolean hasReadPermission =
                permissionService.hasPermission(
                        document,
                        user,
                        "READ"
                );

        if (isOwner || hasReadPermission) {

            activityService.log(
                    user,
                    document,
                    "DOCUMENT_VIEWED",
                    "Viewed document: "
                            + document.getName()
            );

            return document;
        }

        return null;
    }

    private void logView(
            Document document,
            String username) {

        User user =
                userRepo.findByUsername(username);

        if (user != null) {

            activityService.log(
                    user,
                    document,
                    "DOCUMENT_VIEWED",
                    "Viewed document: "
                            + document.getName()
            );
        }
    }

    public boolean canDownload(
            Long id,
            String username,
            boolean isAdmin) {

        Document document =
                getDocumentForUser(
                        id,
                        username,
                        isAdmin
                );

        if (document == null) {
            return false;
        }

        if (isAdmin) {
            return true;
        }

        User user =
                userRepo.findByUsername(username);

        if (user == null) {
            return false;
        }

        if (document.getOwner() != null
                && document.getOwner()
                        .getId()
                        .equals(user.getId())) {

            return true;
        }

        return permissionService.hasPermission(
                document,
                user,
                "DOWNLOAD"
        );
    }

    public void logDownload(
            Long id,
            String username,
            boolean isAdmin) {

        Document document =
                documentRepo.findById(id)
                        .orElse(null);

        User user =
                userRepo.findByUsername(username);

        if (document != null && user != null) {

            activityService.log(
                    user,
                    document,
                    "DOCUMENT_DOWNLOADED",
                    "Downloaded document: "
                            + document.getName()
            );
        }
    }

    public Document updateDocument(
            Long id,
            Document updatedDocument,
            String username,
            boolean isAdmin) {

        Document existing =
                documentRepo.findById(id)
                        .orElse(null);

        if (existing == null) {
            return null;
        }

        User user =
                userRepo.findByUsername(username);

        if (user == null) {
            return null;
        }

        boolean isOwner =
                existing.getOwner() != null
                && existing.getOwner()
                        .getId()
                        .equals(user.getId());

        boolean canEdit =
                isAdmin
                || isOwner
                || permissionService.hasPermission(
                        existing,
                        user,
                        "EDIT"
                );

        if (!canEdit) {
            return null;
        }

        if (updatedDocument.getName() != null
                && !updatedDocument.getName().isBlank()) {

            existing.setName(
                    updatedDocument.getName()
            );
        }

        Document savedDocument =
                documentRepo.save(existing);

        activityService.log(
                user,
                savedDocument,
                "DOCUMENT_UPDATED",
                "Updated document: "
                        + savedDocument.getName()
        );

        return savedDocument;
    }

    public boolean deleteDocument(
            Long id,
            String username,
            boolean isAdmin) {

        Document document =
                documentRepo.findById(id)
                        .orElse(null);

        if (document == null) {
            return false;
        }

        User user =
                userRepo.findByUsername(username);

        if (user == null) {
            return false;
        }

        boolean isOwner =
                document.getOwner() != null
                && document.getOwner()
                        .getId()
                        .equals(user.getId());

        boolean canDelete =
                isAdmin
                || isOwner
                || permissionService.hasPermission(
                        document,
                        user,
                        "DELETE"
                );

        if (!canDelete) {
            return false;
        }

        activityService.log(
                user,
                document,
                "DOCUMENT_DELETED",
                "Deleted document: "
                        + document.getName()
        );

        documentRepo.delete(document);

        return true;
    }
}