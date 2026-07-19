package com.parcelshipping.shipments.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
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

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<ApiErrorResponse> handleMissingParameter(
                        MissingServletRequestParameterException exception,
                        HttpServletRequest request) {
                FieldErrorResponse fieldError = new FieldErrorResponse(
                                exception.getParameterName(),
                                "required parameter is missing");

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "MISSING_REQUIRED_PARAMETER",
                                "A required request parameter is missing.",
                                request.getRequestURI(),
                                List.of(fieldError));
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
                        MethodArgumentTypeMismatchException exception,
                        HttpServletRequest request) {
                FieldErrorResponse fieldError = new FieldErrorResponse(
                                exception.getName(),
                                "invalid parameter format");

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "INVALID_PARAMETER_FORMAT",
                                "A request parameter have an invalid format.",
                                request.getRequestURI(),
                                List.of(fieldError));
        }

        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
                        ConstraintViolationException exception,
                        HttpServletRequest request) {
                List<FieldErrorResponse> fieldErrors = exception.getConstraintViolations()
                                .stream()
                                .map(violation -> new FieldErrorResponse(
                                                violation.getPropertyPath().toString(),
                                                violation.getMessage()))
                                .toList();

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "VALIDATION_ERROR",
                                "Request validation failed.",
                                request.getRequestURI(),
                                fieldErrors);
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
                        IllegalArgumentException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "INVALID_REQUEST",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(ShipmentNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleShipmentNotFound(
                        ShipmentNotFoundException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.NOT_FOUND,
                                "SHIPMENT_NOT_FOUND",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(PodNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handlePodNotFound(
                        PodNotFoundException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.NOT_FOUND,
                                "POD_NOT_FOUND",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(PodFileNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handlePodFileNotFound(
                        PodFileNotFoundException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.CONFLICT,
                                "POD_FILE_NOT_FOUND",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(PodNotAvailableException.class)
        public ResponseEntity<ApiErrorResponse> handlePodNotAvailable(
                        PodNotAvailableException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.CONFLICT,
                                "POD_NOT_AVAILABLE",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(ShipmentExportNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleExportNotFound(
                        ShipmentExportNotFoundException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.NOT_FOUND,
                                "EXPORT_NOT_FOUND",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(ShipmentExportFileNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleExportFileNotFound(
                        ShipmentExportFileNotFoundException exception,
                        HttpServletRequest request) {
                return buildResponse(
                                HttpStatus.CONFLICT,
                                "EXPORT_FILE_NOT_FOUND",
                                exception.getMessage(),
                                request.getRequestURI(),
                                List.of());
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleUnexpectedError(
                        Exception exception,
                        HttpServletRequest request) {
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
                                .cacheControl(
                                                CacheControl.noStore())
                                .header(
                                                HttpHeaders.PRAGMA,
                                                "no-cache")
                                .body(response);
        }
}
