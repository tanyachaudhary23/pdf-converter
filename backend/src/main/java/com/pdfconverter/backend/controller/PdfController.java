package com.pdfconverter.backend.controller;

import com.pdfconverter.backend.service.PdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/convert")
public class PdfController {

    private final PdfService pdfService;

    public PdfController(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    @PostMapping("/image-to-pdf")
    public ResponseEntity<byte[]> imageToPdf(@RequestParam("file") MultipartFile file) throws IOException {
        byte[] pdf = pdfService.convertImageToPdf(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=converted.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}