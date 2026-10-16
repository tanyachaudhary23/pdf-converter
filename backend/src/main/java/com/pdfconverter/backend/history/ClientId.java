package com.pdfconverter.backend.history;

import java.util.regex.Pattern;

/**
 * The browser invents a random id (like a UUID) and sends it in the X-Client-Id header.
 * It is how the server knows "which browser's history" to show. There are no accounts.
 */
public final class ClientId {

    public static final String HEADER = "X-Client-Id";

    // only letters, digits and dashes, 8 to 64 characters (a UUID fits)
    private static final Pattern VALID = Pattern.compile("^[A-Za-z0-9-]{8,64}$");

    private ClientId() {
    }

    public static boolean isValid(String value) {
        return value != null && VALID.matcher(value).matches();
    }
}
