package com.parcelshipping.shipments.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ShipmentResponse(
        UUID id,
        String trackingCode,
        LocalDateTime dispatchDate,
        String status,
        LocalDateTime statusDate,
        String proofOfDelivery,
        long podCount,
        LocalDateTime exportedAt
) {
}
