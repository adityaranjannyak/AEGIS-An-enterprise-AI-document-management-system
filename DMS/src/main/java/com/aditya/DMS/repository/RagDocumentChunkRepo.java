package com.aditya.DMS.repository;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class RagDocumentChunkRepo {

    private final JdbcTemplate jdbcTemplate;

    public RagDocumentChunkRepo(
            @Qualifier("ragJdbcTemplate") JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate = jdbcTemplate;
    }

    public void saveChunk(
            long documentId,
            int chunkIndex,
            String content,
            List<Double> embedding) {

        String vector = embedding.toString();

        String sql = """
                INSERT INTO document_chunks
                    (document_id, chunk_index, content, embedding)
                VALUES (?, ?, ?, ?::vector)
                """;

        jdbcTemplate.update(
                sql,
                documentId,
                chunkIndex,
                content,
                vector
        );
    }

    public List<RagChunk> searchSimilarChunks(
            long documentId,
            List<Double> queryEmbedding,
            int limit) {

        String vector = queryEmbedding.toString();

        String sql = """
                SELECT chunk_index, content
                FROM document_chunks
                WHERE document_id = ?
                ORDER BY embedding <=> ?::vector
                LIMIT ?
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new RagChunk(
                        rs.getInt("chunk_index"),
                        rs.getString("content")
                ),
                documentId,
                vector,
                limit
        );
    }

    public record RagChunk(
            int chunkIndex,
            String content) {
    }
}