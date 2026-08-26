package com.aditya.DMS.service;

import java.io.IOException;
import java.nio.file.Path;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

@Service
public class PdfTextExtractorService {

    public String extractText(Path filePath) throws IOException {

        try (PDDocument document = Loader.loadPDF(filePath.toFile())) {

            PDFTextStripper pdfTextStripper = new PDFTextStripper();

            String text = pdfTextStripper.getText(document);

            return cleanText(text);
        }
    }

    private String cleanText(String text) {

        if (text == null || text.isBlank()) {
            return "";
        }

        // Normalize Windows-style line endings
        text = text.replace("\r\n", "\n");

        // Remove remaining carriage returns
        text = text.replace("\r", "\n");

        // Remove non-breaking spaces
        text = text.replace('\u00A0', ' ');

        // Replace multiple spaces/tabs with a single space
        text = text.replaceAll("[ \\t]+", " ");

        // Remove lines containing only a page number
        text = text.replaceAll("(?m)^\\s*\\d+\\s*$\\n?", "");

        // Remove excessive blank lines
        text = text.replaceAll("\\n{3,}", "\n\n");

        // Remove spaces at the beginning/end of each line
        text = text.replaceAll("(?m)^\\s+|\\s+$", "");

        return text.trim();
    }
}