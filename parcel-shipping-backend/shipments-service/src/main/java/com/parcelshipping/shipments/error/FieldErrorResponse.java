package com.parcelshipping.shipments.error;

public record FieldErrorResponse(
        String field,
        String message
) {
}