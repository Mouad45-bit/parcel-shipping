package com.parcelshipping.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parcelshipping.auth.error.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.csrf.InvalidCsrfTokenException;
import org.springframework.security.web.csrf.MissingCsrfTokenException;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

@Component
public class RestAccessDeniedHandler
        implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public RestAccessDeniedHandler(
            ObjectMapper objectMapper
    ) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException exception
    ) throws IOException {
        if (response.isCommitted()) {
            return;
        }

        boolean csrfFailure =
                exception
                        instanceof MissingCsrfTokenException
                        || exception
                        instanceof InvalidCsrfTokenException;

        HttpStatus status = HttpStatus.FORBIDDEN;

        ApiErrorResponse responseBody =
                new ApiErrorResponse(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        csrfFailure
                                ? "INVALID_CSRF_TOKEN"
                                : "ACCESS_DENIED",
                        csrfFailure
                                ? "The CSRF token is missing or invalid."
                                : "You are not allowed to perform this action.",
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

        objectMapper.writeValue(
                response.getOutputStream(),
                responseBody
        );
    }
}
