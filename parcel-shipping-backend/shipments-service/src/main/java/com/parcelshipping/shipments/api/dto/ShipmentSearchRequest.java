package com.parcelshipping.shipments.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record ShipmentSearchRequest(
        @NotBlank(message = "client is required")
        String client,

        String trackingCode,

        LocalDate dispatchDateFrom,
        LocalDate dispatchDateTo,

        String status,

        String proofOfDelivery,

        LocalDate statusDateFrom,
        LocalDate statusDateTo,

        @Min(value = 0, message = "page must be greater than or equal to 0")
        Integer page,

        @Min(value = 1, message = "size must be greater than or equal to 1")
        @Max(value = 20, message = "size must be less than or equal to 20")
        Integer size,

        String sortBy,
        String sortDirection
) {
}