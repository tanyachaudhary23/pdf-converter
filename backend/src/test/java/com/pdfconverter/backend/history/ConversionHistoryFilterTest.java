package com.pdfconverter.backend.history;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ConversionHistoryFilterTest {

    private static final String CLIENT = "11111111-2222-3333-4444-555555555555";

    private final ConversionRecordRepository repository = mock(ConversionRecordRepository.class);
    private final ConversionHistoryFilter filter = new ConversionHistoryFilter(repository);

    private MockHttpServletRequest post(String path, String clientId) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        if (clientId != null) {
            request.addHeader(ClientId.HEADER, clientId);
        }
        request.setContent(new byte[1234]);
        return request;
    }

    private FilterChain answerWith(int status) {
        return (req, res) -> ((MockHttpServletResponse) res).setStatus(status);
    }

    @Test
    void recordsASuccessfulConversion() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(post("/api/convert/merge-pdfs", CLIENT), response, answerWith(200));

        ArgumentCaptor<ConversionRecord> saved = ArgumentCaptor.forClass(ConversionRecord.class);
        verify(repository).save(saved.capture());
        assertEquals("merge-pdfs", saved.getValue().getTool());
        assertEquals(CLIENT, saved.getValue().getClientId());
        assertEquals(200, saved.getValue().getHttpStatus());
        assertEquals(1234, saved.getValue().getRequestBytes());
        assertTrue(HistoryItem.from(saved.getValue()).success());
    }

    @Test
    void recordsAFailedConversion() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(post("/api/convert/split-pdf", CLIENT), response, answerWith(400));

        ArgumentCaptor<ConversionRecord> saved = ArgumentCaptor.forClass(ConversionRecord.class);
        verify(repository).save(saved.capture());
        assertEquals(400, saved.getValue().getHttpStatus());
        assertFalse(HistoryItem.from(saved.getValue()).success());
    }

    @Test
    void ignoresRequestsWithoutAClientId() throws Exception {
        filter.doFilter(post("/api/convert/merge-pdfs", null), new MockHttpServletResponse(), answerWith(200));

        verifyNoInteractions(repository);
    }

    @Test
    void ignoresOtherAddressesAndMethods() throws Exception {
        filter.doFilter(post("/api/convert/not-a-tool", CLIENT), new MockHttpServletResponse(), answerWith(404));
        filter.doFilter(post("/actuator/health", CLIENT), new MockHttpServletResponse(), answerWith(200));
        MockHttpServletRequest get = new MockHttpServletRequest("GET", "/api/convert/merge-pdfs");
        get.addHeader(ClientId.HEADER, CLIENT);
        filter.doFilter(get, new MockHttpServletResponse(), answerWith(200));

        verifyNoInteractions(repository);
    }

    @Test
    void aDatabaseFailureNeverBreaksTheConversion() throws Exception {
        when(repository.save(any())).thenThrow(new RuntimeException("database is down"));
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(post("/api/convert/images-to-pdf", CLIENT), response, answerWith(200));

        assertEquals(200, response.getStatus());
    }

    @Test
    void clientIdMustLookLikeAnId() {
        assertTrue(ClientId.isValid(CLIENT));
        assertFalse(ClientId.isValid(null));
        assertFalse(ClientId.isValid("short"));
        assertFalse(ClientId.isValid("has spaces in it 123456"));
        assertFalse(ClientId.isValid("<script>alert(1)</script>"));
    }
}
