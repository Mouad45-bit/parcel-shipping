package com.parcelshipping.shipments.error;

public class PodGenerationException
        extends RuntimeException {

    public PodGenerationException(
            String message
    ) {
        super(message);
    }

    public PodGenerationException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}
