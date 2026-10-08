package com.pdfconverter.backend.service;

import com.pdfconverter.backend.exception.InvalidFileException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PdfServiceTest {

    private final PdfService service = new PdfService();

    private MockMultipartFile pngFile(String name) throws IOException {
        BufferedImage img = new BufferedImage(100, 50, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "png", out);
        return new MockMultipartFile("files", name, "image/png", out.toByteArray());
    }

    @Test
    void createsOnePagePerImage() throws IOException {
        byte[] pdf = service.convertImagesToPdf(List.of(pngFile("a.png"), pngFile("b.png")));

        try (PDDocument doc = Loader.loadPDF(pdf)) {
            assertEquals(2, doc.getNumberOfPages());
        }
    }

    @Test
    void rejectsNonImageFile() {
        MockMultipartFile fake = new MockMultipartFile("files", "notes.png", "image/png", "hello".getBytes());

        assertThrows(InvalidFileException.class, () -> service.convertImagesToPdf(List.of(fake)));
    }

    @Test
    void rejectsEmptyList() {
        assertThrows(InvalidFileException.class, () -> service.convertImagesToPdf(List.of()));
    }

    @Test
    void rejectsMoreThanTenFiles() throws IOException {
        List<MockMultipartFile> files = new ArrayList<>();
        for (int i = 0; i < 11; i++) {
            files.add(pngFile("img" + i + ".png"));
        }

        assertThrows(InvalidFileException.class, () -> service.convertImagesToPdf(new ArrayList<>(files)));
    }
}