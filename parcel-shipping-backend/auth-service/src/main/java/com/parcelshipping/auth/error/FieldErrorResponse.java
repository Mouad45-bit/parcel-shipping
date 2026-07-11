package com.parcelshipping.auth.error;

public record FieldErrorResponse(
        String field,
        String message
) {
}
