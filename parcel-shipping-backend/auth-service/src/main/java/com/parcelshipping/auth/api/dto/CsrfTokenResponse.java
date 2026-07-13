package com.parcelshipping.auth.api.dto;

public record CsrfTokenResponse(
        String token,
        String headerName
) {
}
