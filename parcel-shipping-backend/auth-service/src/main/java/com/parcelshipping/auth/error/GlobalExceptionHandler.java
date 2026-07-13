package com.parcelshipping.auth.error;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger LOGGER = LoggerFactory.getLogger(
                        GlobalExceptionHandler.class);

        @ExceptionHandler(InvalidCredentialsException.class)
        public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(
                        InvalidCredentialsException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.UNAUTHORIZED,
                                "INVALID_CREDENTIALS",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> handleValidationError(
                        MethodArgumentNotValidException exception,
                        HttpServletRequest request) {
                List<FieldErrorResponse> fieldErrors = exception.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(fieldError -> new FieldErrorResponse(
                                                fieldError.getField(),
                                                fieldError
                                                                .getDefaultMessage() == null
                                                                                ? "invalid value"
                                                                                : fieldError
                                                                                                .getDefaultMessage()))
                                .toList();

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "VALIDATION_ERROR",
                                "Request validation failed.",
                                request.getRequestURI(),
                                fieldErrors);
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiErrorResponse> handleUnreadableBody(
                        HttpMessageNotReadableException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "INVALID_REQUEST_BODY",
                                "The request body is invalid.",
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(InvalidSessionException.class)
        public ResponseEntity<ApiErrorResponse> handleInvalidSession(
                        InvalidSessionException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.UNAUTHORIZED,
                                "INVALID_SESSION",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(InvalidCurrentPasswordException.class)
        public ResponseEntity<ApiErrorResponse> handleInvalidCurrentPassword(
                        InvalidCurrentPasswordException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "INVALID_CURRENT_PASSWORD",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(PasswordReuseException.class)
        public ResponseEntity<ApiErrorResponse> handlePasswordReuse(
                        PasswordReuseException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "PASSWORD_REUSE_NOT_ALLOWED",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleUnexpectedError(
                        Exception exception,
                        HttpServletRequest request) {
                LOGGER.error(
                                "Unexpected authentication error",
                                exception);

                return buildResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "INTERNAL_SERVER_ERROR",
                                "An unexpected error occurred.",
                                request.getRequestURI(),
                                List.of());
        }

        private ResponseEntity<ApiErrorResponse> buildResponse(
                        HttpStatus status,
                        String code,
                        String message,
                        String path,
                        List<FieldErrorResponse> fieldErrors) {
                ApiErrorResponse response = new ApiErrorResponse(
                                Instant.now(),
                                status.value(),
                                status.getReasonPhrase(),
                                code,
                                message,
                                path,
                                fieldErrors);

                return ResponseEntity
                                .status(status)
                                .cacheControl(CacheControl.noStore())
                                .body(response);
        }
}
