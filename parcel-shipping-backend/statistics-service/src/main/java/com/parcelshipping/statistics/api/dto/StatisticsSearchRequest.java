package com.parcelshipping.statistics.api.dto;

import java.time.LocalDate;

public record StatisticsSearchRequest(
        String client,
        String trackingCode,
        LocalDate dispatchDateFrom,
        LocalDate dispatchDateTo,
        String status,
        String proofOfDelivery,
        LocalDate statusDateFrom,
        LocalDate statusDateTo
) {

    private static final int CLIENT_MAX_LENGTH = 80;
    private static final int TRACKING_CODE_MAX_LENGTH = 40;
    private static final int FILTER_MAX_LENGTH = 30;

    public StatisticsSearchRequest {
        client = normalizeRequired(
                client,
                "client",
                CLIENT_MAX_LENGTH
        );

        trackingCode = normalizeOptional(
                trackingCode,
                "trackingCode",
                TRACKING_CODE_MAX_LENGTH
        );

        status = normalizeOptional(
                status,
                "status",
                FILTER_MAX_LENGTH
        );

        proofOfDelivery = normalizeOptional(
                proofOfDelivery,
                "proofOfDelivery",
                FILTER_MAX_LENGTH
        );

        validateDateRange(
                dispatchDateFrom,
                dispatchDateTo,
                "dispatchDateFrom",
                "dispatchDateTo"
        );

        validateDateRange(
                statusDateFrom,
                statusDateTo,
                "statusDateFrom",
                "statusDateTo"
        );
    }

    private static String normalizeRequired(
            String value,
            String fieldName,
            int maximumLength
    ) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    fieldName + " is required."
            );
        }

        String normalizedValue = value.trim();

        validateMaximumLength(
                normalizedValue,
                fieldName,
                maximumLength
        );

        return normalizedValue;
    }

    private static String normalizeOptional(
            String value,
            String fieldName,
            int maximumLength
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalizedValue = value.trim();

        validateMaximumLength(
                normalizedValue,
                fieldName,
                maximumLength
        );

        return normalizedValue;
    }

    private static void validateMaximumLength(
            String value,
            String fieldName,
            int maximumLength
    ) {
        if (value.length() > maximumLength) {
            throw new IllegalArgumentException(
                    fieldName
                            + " must not exceed "
                            + maximumLength
                            + " characters."
            );
        }
    }

    private static void validateDateRange(
            LocalDate from,
            LocalDate to,
            String fromFieldName,
            String toFieldName
    ) {
        if (
                from != null
                        && to != null
                        && from.isAfter(to)
        ) {
            throw new IllegalArgumentException(
                    fromFieldName
                            + " must be before or equal to "
                            + toFieldName
                            + "."
            );
        }
    }
}
