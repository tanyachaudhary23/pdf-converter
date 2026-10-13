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
import java.util.ArrayList;
import java.util.List;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;

import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.apache.pdfbox.io.IOUtils;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.multipdf.PDFMergerUtility;

@Service
public class PdfService {

    private static final int MAX_FILES = 10;
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private static final int MAX_PDF_PAGES = 50;
    private static final float RENDER_DPI = 150f;
    private static final int MAX_MERGED_PAGES = 200;

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

    public byte[] convertPdfToImages(MultipartFile file) throws IOException {
        validatePdf(file);

        try (PDDocument document = loadPdf(file);
             ByteArrayOutputStream bytes = new ByteArrayOutputStream();
             ZipOutputStream zip = new ZipOutputStream(bytes)) {

            int pageCount = document.getNumberOfPages();
            if (pageCount > MAX_PDF_PAGES) {
                throw new InvalidFileException("PDF has " + pageCount + " pages. The maximum is " + MAX_PDF_PAGES + ".");
            }

            PDFRenderer renderer = new PDFRenderer(document);
            for (int i = 0; i < pageCount; i++) {
                BufferedImage image = renderer.renderImageWithDPI(i, RENDER_DPI, ImageType.RGB);

                zip.putNextEntry(new ZipEntry("page-" + (i + 1) + ".png"));
                ImageIO.write(image, "png", zip);
                zip.closeEntry();
            }

            zip.finish();
            return bytes.toByteArray();
        }
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Please upload a PDF file.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("File '" + file.getOriginalFilename() + "' is larger than 10 MB.");
        }
    }

    private PDDocument loadPdf(MultipartFile file) throws IOException {
        byte[] data = file.getBytes();
        try {
            return Loader.loadPDF(data);
        } catch (InvalidPasswordException e) {
            throw new InvalidFileException("File '" + file.getOriginalFilename() + "' is password-protected.");
        } catch (IOException e) {
            throw new InvalidFileException("File '" + file.getOriginalFilename() + "' is not a valid PDF.");
        }
    }

    public byte[] mergePdfs(List<MultipartFile> files) throws IOException {
        if (files == null || files.size() < 2) {
            throw new InvalidFileException("Please upload at least two PDFs to merge.");
        }
        if (files.size() > MAX_FILES) {
            throw new InvalidFileException("You can merge at most " + MAX_FILES + " PDFs at once.");
        }

        PDFMergerUtility merger = new PDFMergerUtility();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        merger.setDestinationStream(out);

        int totalPages = 0;
        for (MultipartFile file : files) {
            validatePdf(file);

            // open it once just to confirm it is a real PDF and count its pages
            try (PDDocument doc = loadPdf(file)) {
                totalPages += doc.getNumberOfPages();
            }
            if (totalPages > MAX_MERGED_PAGES) {
                throw new InvalidFileException("The merged PDF would exceed " + MAX_MERGED_PAGES + " pages.");
            }

            merger.addSource(new RandomAccessReadBuffer(file.getBytes()));
        }

        merger.mergeDocuments(IOUtils.createMemoryOnlyStreamCache());
        return out.toByteArray();
    }

    public byte[] splitPdf(MultipartFile file, String ranges) throws IOException {
        validatePdf(file);
        if (ranges == null || ranges.isBlank()) {
            throw new InvalidFileException("Please provide page ranges, for example (1-3,5-6),(1-3,5),(1,5-6).");
        }

        try (PDDocument source = loadPdf(file);
             ByteArrayOutputStream zipBytes = new ByteArrayOutputStream();
             ZipOutputStream zip = new ZipOutputStream(zipBytes)) {

            int totalPages = source.getNumberOfPages();
            if (totalPages > MAX_PDF_PAGES) {
                throw new InvalidFileException("PDF has " + totalPages + " pages. The maximum is " + MAX_PDF_PAGES + ".");
            }

            List<int[]> parsed = parseRanges(ranges, totalPages);

            int partNumber = 1;
            for (int[] range : parsed) {
                try (PDDocument part = new PDDocument()) {
                    for (int page = range[0]; page <= range[1]; page++) {
                        part.importPage(source.getPage(page - 1));
                    }

                    ByteArrayOutputStream partBytes = new ByteArrayOutputStream();
                    part.save(partBytes);

                    zip.putNextEntry(new ZipEntry("part-" + partNumber + ".pdf"));
                    zip.write(partBytes.toByteArray());
                    zip.closeEntry();
                }
                partNumber++;
            }

            zip.finish();
            return zipBytes.toByteArray();
        }
    }

    private List<int[]> parseRanges(String ranges, int totalPages) {
        List<int[]> result = new ArrayList<>();
        String[] tokens = ranges.split(",");

        if (tokens.length > MAX_PDF_PAGES) {
            throw new InvalidFileException("Too many ranges.");
        }

        for (String raw : tokens) {
            String token = raw.trim();
            try {
                int start;
                int end;
                if (token.contains("-")) {
                    String[] parts = token.split("-");
                    if (parts.length != 2) {
                        throw new NumberFormatException();
                    }
                    start = Integer.parseInt(parts[0].trim());
                    end = Integer.parseInt(parts[1].trim());
                } else {
                    start = Integer.parseInt(token);
                    end = start;
                }

                if (start < 1 || end < start || end > totalPages) {
                    throw new InvalidFileException(
                            "Range '" + token + "' is invalid. The PDF has " + totalPages + " pages.");
                }
                result.add(new int[]{start, end});
            } catch (NumberFormatException e) {
                throw new InvalidFileException("'" + token + "' is not a valid page range. Use a format like 1-3,5.");
            }
        }
        return result;
    }
}