package com.parcelshipping.shipments.repository;

import java.util.UUID;

public interface ShipmentPodCountProjection {

    UUID getShipmentId();

    long getPodCount();
}
