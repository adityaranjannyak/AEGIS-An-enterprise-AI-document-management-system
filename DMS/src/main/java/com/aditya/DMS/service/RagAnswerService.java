package com.aditya.DMS.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.aditya.DMS.entity.Document;
import com.aditya.DMS.repository.RagDocumentChunkRepo;

@Service
public class RagAnswerService {

    private final RagRetrievalService ragRetrievalService;
    private final LlmService llmService;
    private final DocumentService documentService;

    public RagAnswerService(
            RagRetrievalService ragRetrievalService,
            LlmService llmService,
            DocumentService documentService) {
        this.ragRetrievalService = ragRetrievalService;
        this.llmService = llmService;
        this.documentService = documentService;
    }

    public String answerQuestion(
            long documentId,
            String question,
            String username,
            boolean isAdmin) {
        return answerQuestionAcrossDocuments(
                List.of(documentId), question, username, isAdmin);
    }

    public String answerQuestionAcrossDocuments(
            List<Long> requestedDocumentIds,
            String question,
            String username,
            boolean isAdmin) {

        if (question == null || question.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Question is required.");
        }

        List<Long> documentIds = requestedDocumentIds == null ||
                requestedDocumentIds.isEmpty()
                ? documentService.getDocumentsForUser(username, isAdmin)
                        .stream().map(Document::getId).toList()
                : requestedDocumentIds;

        StringBuilder contextBuilder = new StringBuilder();

        for (Long documentId : documentIds) {
            Document document = documentService.getDocumentForUser(
                    documentId, username, isAdmin);
            if (document == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You do not have access to one or more selected documents.");
            }

            List<RagDocumentChunkRepo.RagChunk> chunks =
                    ragRetrievalService.retrieveRelevantChunks(
                            documentId, question, 5);

            for (RagDocumentChunkRepo.RagChunk chunk : chunks) {
                contextBuilder
                        .append("DOCUMENT: ")
                        .append(document.getName())
                        .append("\nCHUNK ")
                        .append(chunk.chunkIndex())
                        .append(":\n")
                        .append(chunk.content())
                        .append("\n\n---\n\n");
            }
        }

        if (contextBuilder.isEmpty()) {
            return "I could not find relevant information in the authorized document scope.";
        }

        String prompt = """
                You are a document question-answering assistant.

                Answer the user's question using ONLY the authorized
                document context below. Do not invent or assume facts.
                If the information is not available in the context,
                clearly say so. When the context comes from multiple
                documents, identify the source document names.

                DOCUMENT CONTEXT:
                %s

                USER QUESTION:
                %s

                ANSWER:
                """.formatted(contextBuilder, question);

        return llmService.generateAnswer(prompt);
    }
}
