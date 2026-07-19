package com.parcelshipping.shipments.error;

public class PodNotAvailableException
        extends RuntimeException {

    public PodNotAvailableException() {
        super(
                "Proof of delivery is not available for this shipment."
        );
    }
}
