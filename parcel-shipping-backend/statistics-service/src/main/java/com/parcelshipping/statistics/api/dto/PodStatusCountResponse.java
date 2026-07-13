package com.parcelshipping.statistics.api.dto;

public record PodStatusCountResponse(
        String proofOfDelivery,
        long count
) {
}
