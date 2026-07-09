package com.parcelshipping.shipments.api.dto;

import java.util.List;

public record ShipmentPageResponse(
        List<ShipmentResponse> items,
        int page,
        int size,
        long totalItems,
        int totalPages,
        boolean first,
        boolean last
) {
}