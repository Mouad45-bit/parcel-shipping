package com.parcelshipping.shipments.service;

import com.parcelshipping.shipments.api.dto.ShipmentResponse;
import com.parcelshipping.shipments.api.dto.ShipmentTrackingResponse;
import com.parcelshipping.shipments.domain.Shipment;
import org.springframework.stereotype.Component;

@Component
public class ShipmentMapper {

    public ShipmentResponse toResponse(Shipment shipment) {
        return toResponse(
                shipment,
                shipment
                        .getProofOfDelivery()
                        .apiValue(),
                0L
        );
    }

    public ShipmentResponse toResponse(
            Shipment shipment,
            String proofOfDelivery,
            long podCount
    ) {
        return new ShipmentResponse(
                shipment.getId(),
                shipment.getTrackingCode(),
                shipment.getDispatchDate(),
                shipment.getStatus().apiValue(),
                shipment.getStatusDate(),
                proofOfDelivery,
                podCount,
                shipment.getExportedAt());
    }

    public ShipmentTrackingResponse toTrackingResponse(
            Shipment shipment,
            long podCount) {
        return new ShipmentTrackingResponse(
                shipment.getId(),
                shipment.getClient(),
                shipment.getTrackingCode(),
                shipment.getDestination(),
                shipment.getDispatchDate(),
                shipment.getStatus().apiValue(),
                shipment.getStatusDate(),
                podCount > 0
                        ? "available"
                        : "missing",
                podCount,
                shipment.getExportedAt());
    }
}
