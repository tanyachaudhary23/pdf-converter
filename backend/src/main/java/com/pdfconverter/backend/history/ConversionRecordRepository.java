package com.pdfconverter.backend.history;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * We only write the method names. Spring Data reads them and writes the SQL for us.
 */
public interface ConversionRecordRepository extends JpaRepository<ConversionRecord, Long> {

    // SELECT ... WHERE client_id = ? ORDER BY created_at DESC LIMIT 50
    List<ConversionRecord> findTop50ByClientIdOrderByCreatedAtDesc(String clientId);

    // DELETE ... WHERE client_id = ?   (returns how many rows were removed)
    @Transactional
    long deleteByClientId(String clientId);
}
