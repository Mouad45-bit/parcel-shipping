package com.parcelshipping.shipments.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ShipmentTrackingResponse(
        UUID id,
        String client,
        String trackingCode,
        String destination,
        LocalDateTime dispatchDate,
        String status,
        LocalDateTime statusDate,
        String proofOfDelivery,
        long podCount
) {
}
