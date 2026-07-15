package com.parcelshipping.shipments.integration.pod;

import java.time.LocalDateTime;

public record PodGenerationRequest(
        String trackingCode,
        String client,
        String destination,
        LocalDateTime dispatchDate,
        LocalDateTime statusDate,
        int position
) {
}
