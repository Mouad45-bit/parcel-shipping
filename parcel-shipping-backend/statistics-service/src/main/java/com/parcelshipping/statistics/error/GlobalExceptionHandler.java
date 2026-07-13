package com.parcelshipping.statistics.error;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    GlobalExceptionHandler.class
            );

    @ExceptionHandler(
            MissingServletRequestParameterException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleMissingParameter(
            MissingServletRequestParameterException exception,
            HttpServletRequest request
    ) {
        FieldErrorResponse fieldError =
                new FieldErrorResponse(
                        exception.getParameterName(),
                        "required parameter is missing"
                );

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "MISSING_REQUIRED_PARAMETER",
                "A required request parameter is missing.",
                request.getRequestURI(),
                List.of(fieldError)
        );
    }

    @ExceptionHandler(
            MethodArgumentTypeMismatchException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
    ) {
        FieldErrorResponse fieldError =
                new FieldErrorResponse(
                        exception.getName(),
                        "invalid parameter format"
                );

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "INVALID_PARAMETER_FORMAT",
                "A request parameter has an invalid format.",
                request.getRequestURI(),
                List.of(fieldError)
        );
    }

    @ExceptionHandler(
            StatisticsClientNotFoundException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleClientNotFound(
            StatisticsClientNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                "STATISTICS_CLIENT_NOT_FOUND",
                exception.getMessage(),
                request.getRequestURI(),
                List.of()
        );
    }

    @ExceptionHandler(
            IllegalArgumentException.class
    )
    public ResponseEntity<ApiErrorResponse>
    handleInvalidRequest(
            IllegalArgumentException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST",
                exception.getMessage(),
                request.getRequestURI(),
                List.of()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse>
    handleUnexpectedError(
            Exception exception,
            HttpServletRequest request
    ) {
        LOGGER.error(
                "Unexpected statistics error",
                exception
        );

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred.",
                request.getRequestURI(),
                List.of()
        );
    }

    private ResponseEntity<ApiErrorResponse>
    buildResponse(
            HttpStatus status,
            String code,
            String message,
            String path,
            List<FieldErrorResponse> fieldErrors
    ) {
        ApiErrorResponse response =
                new ApiErrorResponse(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        code,
                        message,
                        path,
                        fieldErrors
                );

        return ResponseEntity
                .status(status)
                .cacheControl(
                        CacheControl.noStore()
                )
                .header(
                        HttpHeaders.PRAGMA,
                        "no-cache"
                )
                .body(response);
    }
}
