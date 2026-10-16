package com.pdfconverter.backend.history;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Runs around every conversion request. After the request is finished it writes one row
 * to the database: which tool, how big, how long, and whether it worked.
 *
 * Why a filter and not code inside each controller method?
 *  - one place instead of four
 *  - it also sees requests that failed before reaching the controller (for example "file too large")
 *  - the existing conversion code does not change at all
 */
@Component
public class ConversionHistoryFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ConversionHistoryFilter.class);

    private static final String PREFIX = "/api/convert/";
    private static final Set<String> TOOLS =
            Set.of("images-to-pdf", "pdf-to-images", "merge-pdfs", "split-pdf");

    private final ConversionRecordRepository repository;

    public ConversionHistoryFilter(ConversionRecordRepository repository) {
        this.repository = repository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return toolOf(request) == null || !ClientId.isValid(request.getHeader(ClientId.HEADER));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        long start = System.nanoTime();
        int status = 500; // if something blows up before we learn the real status, count it as a failure
        try {
            chain.doFilter(request, response);
            status = response.getStatus();
        } finally {
            save(request, status, start);
        }
    }

    private void save(HttpServletRequest request, int status, long startNanos) {
        try {
            long millis = (System.nanoTime() - startNanos) / 1_000_000;
            long bytes = Math.max(request.getContentLengthLong(), 0);
            repository.save(new ConversionRecord(
                    request.getHeader(ClientId.HEADER), toolOf(request), status, bytes, millis));
        } catch (Exception e) {
            // History is a bonus feature. If the database is down, the conversion must still work.
            log.warn("Could not save conversion history: {}", e.getMessage());
        }
    }

    /** Returns the tool name for POST /api/convert/<tool>, or null for anything else. */
    private static String toolOf(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod())) {
            return null;
        }
        String path = request.getRequestURI();
        if (path == null || !path.startsWith(PREFIX)) {
            return null;
        }
        String tool = path.substring(PREFIX.length());
        return TOOLS.contains(tool) ? tool : null;
    }
}
