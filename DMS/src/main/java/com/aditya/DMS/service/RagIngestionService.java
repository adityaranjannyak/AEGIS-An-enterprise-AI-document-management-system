package com.aditya.DMS.service;

import com.aditya.DMS.repository.RagDocumentChunkRepo;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@Service
public class RagIngestionService {

    private final PdfTextExtractorService pdfTextExtractorService;
    private final TextChunkerService textChunkerService;
    private final EmbeddingService embeddingService;
    private final RagDocumentChunkRepo ragDocumentChunkRepo;

    public RagIngestionService(
            PdfTextExtractorService pdfTextExtractorService,
            TextChunkerService textChunkerService,
            EmbeddingService embeddingService,
            RagDocumentChunkRepo ragDocumentChunkRepository) {

        this.pdfTextExtractorService = pdfTextExtractorService;
        this.textChunkerService = textChunkerService;
        this.embeddingService = embeddingService;
        this.ragDocumentChunkRepo = ragDocumentChunkRepository;
    }

    public int ingestDocument(long documentId, Path filePath)
            throws IOException {

        // 1. Extract text from PDF
        String text = pdfTextExtractorService.extractText(filePath);

        // 2. Split extracted text into chunks
        List<String> chunks = textChunkerService.splitText(text);

        // 3. Generate embedding and store each chunk
        for (int i = 0; i < chunks.size(); i++) {

            String chunk = chunks.get(i);

            List<Double> embedding = embeddingService.embed(chunk);

            ragDocumentChunkRepo.saveChunk(
                    documentId,
                    i,
                    chunk,
                    embedding
            );
        }

        return chunks.size();
    }
}