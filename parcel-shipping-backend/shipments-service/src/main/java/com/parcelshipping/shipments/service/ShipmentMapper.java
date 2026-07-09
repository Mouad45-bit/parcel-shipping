package com.parcelshipping.shipments.service;

import com.parcelshipping.shipments.api.dto.ShipmentResponse;
import com.parcelshipping.shipments.domain.Shipment;
import org.springframework.stereotype.Component;

@Component
public class ShipmentMapper {

    public ShipmentResponse toResponse(Shipment shipment) {
        return new ShipmentResponse(
                shipment.getId(),
                shipment.getTrackingCode(),
                shipment.getDispatchDate(),
                shipment.getStatus().apiValue(),
                shipment.getStatusDate(),
                shipment.getProofOfDelivery().apiValue(),
                shipment.getExportedAt()
        );
    }
}