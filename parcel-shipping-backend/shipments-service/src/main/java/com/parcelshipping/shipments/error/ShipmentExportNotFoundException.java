package com.parcelshipping.shipments.error;

import java.util.UUID;

public class ShipmentExportNotFoundException
        extends RuntimeException {

    public ShipmentExportNotFoundException(
            UUID exportId
    ) {
        super(
                "Export not found: "
                        + exportId
                        + "."
        );
    }
}
