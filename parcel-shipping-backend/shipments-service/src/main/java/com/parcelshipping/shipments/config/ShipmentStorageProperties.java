package com.parcelshipping.shipments.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.file.Path;

@ConfigurationProperties(
        prefix = "shipment-storage"
)
public record ShipmentStorageProperties(
        Path podsRoot,
        Path exportsRoot
) {

    public ShipmentStorageProperties {
        if (podsRoot == null) {
            throw new IllegalArgumentException(
                    "shipment-storage.pods-root is required."
            );
        }

        if (exportsRoot == null) {
            throw new IllegalArgumentException(
                    "shipment-storage.exports-root is required."
            );
        }

        podsRoot =
                podsRoot
                        .toAbsolutePath()
                        .normalize();

        exportsRoot =
                exportsRoot
                        .toAbsolutePath()
                        .normalize();
    }
}
