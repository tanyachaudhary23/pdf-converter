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
import java.util.List;

@RestController
@RequestMapping("/api/convert")
public class PdfController {

    private final PdfService pdfService;

    public PdfController(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    @PostMapping("/images-to-pdf")
    public ResponseEntity<byte[]> imagesToPdf(@RequestParam("files") List<MultipartFile> files) throws IOException {
        byte[] pdf = pdfService.convertImagesToPdf(files);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=converted.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
    @PostMapping("/pdf-to-images")
    public ResponseEntity<byte[]> pdfToImages(@RequestParam("file") MultipartFile file) throws IOException {
        byte[] zip = pdfService.convertPdfToImages(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=pages.zip")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(zip);
    }

    @PostMapping("/merge-pdfs")
    public ResponseEntity<byte[]> mergePdfs(@RequestParam("files") List<MultipartFile> files) throws IOException {
        byte[] pdf = pdfService.mergePdfs(files);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=merged.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/split-pdf")
    public ResponseEntity<byte[]> splitPdf(@RequestParam("file") MultipartFile file,
                                           @RequestParam("ranges") String ranges) throws IOException {
        byte[] zip = pdfService.splitPdf(file, ranges);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=split.zip")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(zip);
    }
}