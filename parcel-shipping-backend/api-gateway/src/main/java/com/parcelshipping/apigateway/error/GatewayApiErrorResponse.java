package com.parcelshipping.apigateway.error;

import java.time.Instant;
import java.util.List;

public record GatewayApiErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String code,
        String message,
        String path,
        List<Object> fieldErrors
) {
}
