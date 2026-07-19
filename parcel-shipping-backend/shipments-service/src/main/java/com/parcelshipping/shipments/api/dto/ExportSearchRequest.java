package com.parcelshipping.shipments.api.dto;

import java.time.LocalDate;

public record ExportSearchRequest(
        String client,
        String trackingCode,
        LocalDate dispatchDateFrom,
        LocalDate dispatchDateTo,
        String status,
        String proofOfDelivery,
        LocalDate exportDateFrom,
        LocalDate exportDateTo,
        Boolean archived,
        Integer page,
        Integer size,
        String sortBy,
        String sortDirection
) {
}
