package com.pdfconverter.backend.service;

import com.pdfconverter.backend.exception.InvalidFileException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class PdfService {

    private static final int MAX_FILES = 10;
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    public byte[] convertImagesToPdf(List<MultipartFile> files) throws IOException {
        validate(files);

        try (PDDocument document = new PDDocument()) {
            for (MultipartFile file : files) {
                BufferedImage image = readImage(file);

                PDPage page = new PDPage(new PDRectangle(image.getWidth(), image.getHeight()));
                document.addPage(page);

                PDImageXObject pdImage = LosslessFactory.createFromImage(document, image);
                try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                    content.drawImage(pdImage, 0, 0, image.getWidth(), image.getHeight());
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    private void validate(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new InvalidFileException("Please upload at least one image.");
        }
        if (files.size() > MAX_FILES) {
            throw new InvalidFileException("You can upload at most " + MAX_FILES + " images at once.");
        }
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                throw new InvalidFileException("File '" + file.getOriginalFilename() + "' is empty.");
            }
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new InvalidFileException("File '" + file.getOriginalFilename() + "' is larger than 10 MB.");
            }
        }
    }

    private BufferedImage readImage(MultipartFile file) throws IOException {
        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) {
            throw new InvalidFileException("File '" + file.getOriginalFilename() + "' is not a valid image.");
        }
        return image;
    }
}