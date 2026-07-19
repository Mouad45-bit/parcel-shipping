package com.parcelshipping.shipments.error;

import java.util.UUID;

public class PodNotFoundException
        extends RuntimeException {

    public PodNotFoundException(
            UUID podId
    ) {
        super(
                "POD not found: "
                        + podId
                        + "."
        );
    }
}
