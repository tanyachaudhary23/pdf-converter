package com.pdfconverter.backend.history;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final ConversionRecordRepository repository;

    public HistoryController(ConversionRecordRepository repository) {
        this.repository = repository;
    }

    /** The latest 50 conversions made by this browser. */
    @GetMapping
    public ResponseEntity<?> list(
            @RequestHeader(value = ClientId.HEADER, required = false) String clientId) {
        if (!ClientId.isValid(clientId)) {
            return missingClientId();
        }
        List<HistoryItem> items = repository.findTop50ByClientIdOrderByCreatedAtDesc(clientId)
                .stream()
                .map(HistoryItem::from)
                .toList();
        return ResponseEntity.ok(items);
    }

    /** Lets people erase their own history. */
    @DeleteMapping
    public ResponseEntity<?> clear(
            @RequestHeader(value = ClientId.HEADER, required = false) String clientId) {
        if (!ClientId.isValid(clientId)) {
            return missingClientId();
        }
        long deleted = repository.deleteByClientId(clientId);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }

    private static ResponseEntity<Map<String, String>> missingClientId() {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Missing or invalid " + ClientId.HEADER + " header."));
    }
}
