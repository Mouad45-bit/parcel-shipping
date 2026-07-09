package com.parcelshipping.shipments.domain;

public enum ShipmentStatus {
    CREATED("created"),
    IN_TRANSIT("in-transit"),
    DELIVERED("delivered"),
    FAILED_DELIVERY("failed-delivery"),
    RETURNED("returned");

    private final String apiValue;

    ShipmentStatus(String apiValue) {
        this.apiValue = apiValue;
    }

    public String apiValue() {
        return apiValue;
    }

    public static ShipmentStatus fromApiValue(String value) {
        for (ShipmentStatus status : values()) {
            if (status.apiValue.equals(value)) {
                return status;
            }
        }

        throw new IllegalArgumentException("Unsupported shipment status: " + value);
    }
}
