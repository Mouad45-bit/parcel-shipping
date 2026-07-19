package com.parcelshipping.shipments.api.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record ExportResponse(
        UUID id,
        UUID shipmentId,
        String client,
        String trackingCode,
        String destination,
        LocalDateTime dispatchDate,
        String status,
        LocalDateTime statusDate,
        String proofOfDelivery,
        long podCount,
        Instant generatedAt,
        Instant archivedAt,
        String contentUrl
) {
}
