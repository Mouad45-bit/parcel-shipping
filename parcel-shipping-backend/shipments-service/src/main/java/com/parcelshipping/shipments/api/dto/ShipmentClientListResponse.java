package com.parcelshipping.shipments.api.dto;

import java.util.List;

public record ShipmentClientListResponse(
        List<ShipmentClientResponse> items
) {
}
