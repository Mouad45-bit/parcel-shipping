package com.parcelshipping.shipments.api.dto;

import java.util.UUID;

public record ShipmentPodItemResponse(
        UUID id,
        int position,
        String contentUrl
) {
}
