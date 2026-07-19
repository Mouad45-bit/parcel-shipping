package com.parcelshipping.shipments.error;

public class PodFileNotFoundException
        extends RuntimeException {

    public PodFileNotFoundException() {
        super(
                "The POD file is missing from storage."
        );
    }
}
