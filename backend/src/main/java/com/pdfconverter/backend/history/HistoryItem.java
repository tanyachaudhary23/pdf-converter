package com.pdfconverter.backend.history;

import java.time.Instant;

/**
 * What we send to the browser. A separate small class (a "DTO") means the database
 * layout and the public API can change independently.
 */
public record HistoryItem(
        Long id,
        String tool,
        boolean success,
        int status,
        long sizeBytes,
        long durationMs,
        Instant createdAt) {

    public static HistoryItem from(ConversionRecord record) {
        int status = record.getHttpStatus();
        return new HistoryItem(
                record.getId(),
                record.getTool(),
                status >= 200 && status < 300,
                status,
                record.getRequestBytes(),
                record.getDurationMs(),
                record.getCreatedAt());
    }
}
