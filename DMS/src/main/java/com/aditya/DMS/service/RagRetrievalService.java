package com.aditya.DMS.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aditya.DMS.repository.RagDocumentChunkRepo;
import com.aditya.DMS.repository.RagDocumentChunkRepo.RagChunk;

@Service
public class RagRetrievalService {

    private final EmbeddingService embeddingService;
    private final RagDocumentChunkRepo ragDocumentChunkRepo;

    public RagRetrievalService(
            EmbeddingService embeddingService,
            RagDocumentChunkRepo ragDocumentChunkRepo) {

        this.embeddingService = embeddingService;
        this.ragDocumentChunkRepo = ragDocumentChunkRepo;
    }

    public List<RagChunk> retrieveRelevantChunks(
            long documentId,
            String question,
            int limit) {

        if (question == null || question.isBlank()) {
            return List.of();
        }

        List<Double> queryEmbedding =
                embeddingService.embed(question);

        return ragDocumentChunkRepo.searchSimilarChunks(
                documentId,
                queryEmbedding,
                limit
        );
    }
}