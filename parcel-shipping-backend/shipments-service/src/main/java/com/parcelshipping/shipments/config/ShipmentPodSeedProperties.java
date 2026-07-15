package com.parcelshipping.shipments.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(
        prefix = "shipment-pod-seed"
)
public record ShipmentPodSeedProperties(
        boolean enabled,
        int minimumCount,
        int maximumCount,
        String randomSeed,
        int batchSize,
        boolean failFast
) {

    public ShipmentPodSeedProperties {
        if (
                minimumCount < 1
                        || minimumCount > 3
        ) {
            throw new IllegalArgumentException(
                    "shipment-pod-seed.minimum-count "
                            + "must be between 1 and 3."
            );
        }

        if (
                maximumCount < minimumCount
                        || maximumCount > 3
        ) {
            throw new IllegalArgumentException(
                    "shipment-pod-seed.maximum-count "
                            + "must be between minimum-count and 3."
            );
        }

        if (
                randomSeed == null
                        || randomSeed.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "shipment-pod-seed.random-seed is required."
            );
        }

        randomSeed = randomSeed.trim();

        if (batchSize < 1 || batchSize > 1000) {
            throw new IllegalArgumentException(
                    "shipment-pod-seed.batch-size "
                            + "must be between 1 and 1000."
            );
        }
    }
}