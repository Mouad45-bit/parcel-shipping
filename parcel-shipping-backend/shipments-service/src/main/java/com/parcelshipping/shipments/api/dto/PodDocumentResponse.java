package com.parcelshipping.shipments.api.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PodDocumentResponse(
        UUID shipmentId,
        String client,
        String trackingCode,
        String destination,
        LocalDateTime dispatchDate,
        String status,
        LocalDateTime statusDate,
        Instant generatedAt,
        List<PodDocumentPodResponse> pods
) {
}
