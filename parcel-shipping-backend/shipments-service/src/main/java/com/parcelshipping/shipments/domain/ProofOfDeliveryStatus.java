package com.parcelshipping.shipments.domain;

public enum ProofOfDeliveryStatus {
    AVAILABLE("available"),
    MISSING("missing");

    private final String apiValue;

    ProofOfDeliveryStatus(String apiValue) {
        this.apiValue = apiValue;
    }

    public String apiValue() {
        return apiValue;
    }

    public static ProofOfDeliveryStatus fromApiValue(String value) {
        for (ProofOfDeliveryStatus status : values()) {
            if (status.apiValue.equals(value)) {
                return status;
            }
        }

        throw new IllegalArgumentException("Unsupported proof of delivery status: " + value);
    }
}
