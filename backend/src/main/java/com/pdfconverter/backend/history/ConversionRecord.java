package com.pdfconverter.backend.history;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * One row in the conversion_records table: "this browser used this tool at this time".
 * We store metadata only. We never store the files or their names.
 */
@Entity
@Table(
        name = "conversion_records",
        indexes = @Index(name = "idx_conversion_client_time", columnList = "client_id, created_at"))
public class ConversionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id", nullable = false, length = 64)
    private String clientId;

    @Column(name = "tool", nullable = false, length = 40)
    private String tool;

    @Column(name = "http_status", nullable = false)
    private int httpStatus;

    @Column(name = "request_bytes", nullable = false)
    private long requestBytes;

    @Column(name = "duration_ms", nullable = false)
    private long durationMs;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    // JPA (Hibernate) needs an empty constructor to create objects when reading rows
    protected ConversionRecord() {
    }

    public ConversionRecord(String clientId, String tool, int httpStatus, long requestBytes, long durationMs) {
        this.clientId = clientId;
        this.tool = tool;
        this.httpStatus = httpStatus;
        this.requestBytes = requestBytes;
        this.durationMs = durationMs;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getClientId() {
        return clientId;
    }

    public String getTool() {
        return tool;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public long getRequestBytes() {
        return requestBytes;
    }

    public long getDurationMs() {
        return durationMs;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
