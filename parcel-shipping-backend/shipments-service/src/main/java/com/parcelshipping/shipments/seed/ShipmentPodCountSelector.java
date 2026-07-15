package com.parcelshipping.shipments.seed;

import com.parcelshipping.shipments.config.ShipmentPodSeedProperties;
import org.springframework.stereotype.Component;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Component
public class ShipmentPodCountSelector {

    private final ShipmentPodSeedProperties properties;

    public ShipmentPodCountSelector(
            ShipmentPodSeedProperties properties
    ) {
        this.properties = properties;
    }

    public int selectCount(
            UUID shipmentId
    ) {
        if (shipmentId == null) {
            throw new IllegalArgumentException(
                    "shipmentId is required."
            );
        }

        byte[] digest = sha256(
                properties.randomSeed()
                        + ":"
                        + shipmentId
        );

        long hashValue =
                ByteBuffer
                        .wrap(digest)
                        .getLong();

        int range =
                properties.maximumCount()
                        - properties.minimumCount()
                        + 1;

        int offset = (int) Math.floorMod(
                hashValue,
                (long) range
        );

        return properties.minimumCount()
                + offset;
    }

    private byte[] sha256(
            String value
    ) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            return digest.digest(
                    value.getBytes(
                            StandardCharsets.UTF_8
                    )
            );
        } catch (
                NoSuchAlgorithmException exception
        ) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable.",
                    exception
            );
        }
    }
}
