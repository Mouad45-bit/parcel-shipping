package com.parcelshipping.shipments.error;

import java.util.UUID;

public class ShipmentNotFoundException
        extends RuntimeException {

    public ShipmentNotFoundException(
            String trackingCode
    ) {
        super(
                "Shipment not found for tracking code: "
                        + trackingCode
                        + "."
        );
    }

    public ShipmentNotFoundException(
            UUID shipmentId
    ) {
        super(
                "Shipment not found: "
                        + shipmentId
                        + "."
        );
    }
}
