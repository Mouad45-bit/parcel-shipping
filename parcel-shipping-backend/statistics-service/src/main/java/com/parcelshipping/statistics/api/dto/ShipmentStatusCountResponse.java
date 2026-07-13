package com.parcelshipping.statistics.api.dto;

public record ShipmentStatusCountResponse(
        String status,
        long count
) {
}
