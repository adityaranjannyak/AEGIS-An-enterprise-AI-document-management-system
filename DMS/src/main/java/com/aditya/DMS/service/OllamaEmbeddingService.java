package com.aditya.DMS.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class OllamaEmbeddingService implements EmbeddingService {

    private final RestClient restClient;

    public OllamaEmbeddingService() {
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:11434")
                .build();
    }

    @Override
    public List<Double> embed(String text) {

        Map<String, Object> request = Map.of(
                "model", "bge-m3",
                "input", text
        );

        OllamaResponse response = restClient.post()
                .uri("/api/embed")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(OllamaResponse.class);

        if (response == null || response.embeddings() == null
                || response.embeddings().isEmpty()) {
            throw new RuntimeException("Failed to generate embedding");
        }

        return response.embeddings().get(0);
    }

    private record OllamaResponse(
            List<List<Double>> embeddings) {
    }
}