package com.parcelshipping.shipments.error;

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
}
