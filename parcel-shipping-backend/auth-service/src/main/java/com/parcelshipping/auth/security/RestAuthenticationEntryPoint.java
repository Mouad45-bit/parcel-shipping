package com.parcelshipping.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parcelshipping.auth.error.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

@Component
public class RestAuthenticationEntryPoint
        implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public RestAuthenticationEntryPoint(
            ObjectMapper objectMapper
    ) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {
        if (response.isCommitted()) {
            return;
        }

        HttpStatus status = HttpStatus.UNAUTHORIZED;

        ApiErrorResponse responseBody =
                new ApiErrorResponse(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        "AUTHENTICATION_REQUIRED",
                        "Authentication is required or "
                                + "the session has expired.",
                        request.getRequestURI(),
                        List.of()
                );

        response.setStatus(status.value());
        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );
        response.setCharacterEncoding(
                StandardCharsets.UTF_8.name()
        );

        response.setHeader(
                HttpHeaders.CACHE_CONTROL,
                "no-store"
        );

        response.setHeader(
                HttpHeaders.PRAGMA,
                "no-cache"
        );

        response.setHeader(
                HttpHeaders.WWW_AUTHENTICATE,
                "Bearer"
        );

        objectMapper.writeValue(
                response.getOutputStream(),
                responseBody
        );
    }
}
