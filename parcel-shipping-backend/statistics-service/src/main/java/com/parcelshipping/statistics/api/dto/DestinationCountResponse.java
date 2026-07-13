package com.parcelshipping.statistics.api.dto;

public record DestinationCountResponse(
        String destination,
        long count
) {
}
