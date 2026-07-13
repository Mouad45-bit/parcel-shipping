package com.parcelshipping.statistics.error;

public record FieldErrorResponse(
        String field,
        String message
) {
}
