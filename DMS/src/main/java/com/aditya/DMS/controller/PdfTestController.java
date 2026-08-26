package com.aditya.DMS.controller;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aditya.DMS.service.PdfTextExtractorService;

@RestController
public class PdfTestController {

    private final PdfTextExtractorService pdfTextExtractorService;

    public PdfTestController(
            PdfTextExtractorService pdfTextExtractorService) {
        this.pdfTextExtractorService = pdfTextExtractorService;
    }

    @GetMapping("/test/pdf-text")
    public String extractPdfText(
            @RequestParam String filename) throws IOException {

        Path filePath = Paths.get("uploads", filename);

        return pdfTextExtractorService.extractText(filePath);
    }
}