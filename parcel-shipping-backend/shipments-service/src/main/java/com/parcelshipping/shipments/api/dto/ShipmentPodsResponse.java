package com.parcelshipping.shipments.api.dto;

import java.util.List;
import java.util.UUID;

public record ShipmentPodsResponse(
        UUID shipmentId,
        int count,
        List<ShipmentPodItemResponse> items
) {
}
