package com.parcelshipping.shipments.error;

public class ShipmentExportFileNotFoundException
        extends RuntimeException {

    public ShipmentExportFileNotFoundException() {
        super(
                "The export file is missing from storage."
        );
    }
}
