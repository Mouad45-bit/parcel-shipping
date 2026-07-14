package com.parcelshipping.shipments.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shipment_pods")
public class ShipmentPod {

    public static final String PNG_MIME_TYPE =
            "image/png";

    @Id
    private UUID id;

    @Column(
            name = "shipment_id",
            nullable = false
    )
    private UUID shipmentId;

    @Column(
            name = "position",
            nullable = false
    )
    private int position;

    @Column(
            name = "storage_key",
            nullable = false,
            unique = true,
            length = 255
    )
    private String storageKey;

    @Column(
            name = "mime_type",
            nullable = false,
            length = 50
    )
    private String mimeType;

    @Column(
            name = "created_at",
            nullable = false
    )
    private Instant createdAt;

    protected ShipmentPod() {
    }

    private ShipmentPod(
            UUID id,
            UUID shipmentId,
            int position,
            String storageKey,
            Instant createdAt
    ) {
        this.id = requireId(id, "id");
        this.shipmentId =
                requireId(
                        shipmentId,
                        "shipmentId"
                );

        this.position =
                requireValidPosition(position);

        this.storageKey =
                requireStorageKey(storageKey);

        this.mimeType = PNG_MIME_TYPE;

        this.createdAt =
                requireInstant(
                        createdAt,
                        "createdAt"
                );
    }

    public static ShipmentPod create(
            UUID shipmentId,
            int position,
            String storageKey,
            Instant createdAt
    ) {
        return new ShipmentPod(
                UUID.randomUUID(),
                shipmentId,
                position,
                storageKey,
                createdAt
        );
    }

    public UUID getId() {
        return id;
    }

    public UUID getShipmentId() {
        return shipmentId;
    }

    public int getPosition() {
        return position;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public String getMimeType() {
        return mimeType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    private static int requireValidPosition(
            int position
    ) {
        if (position < 1 || position > 3) {
            throw new IllegalArgumentException(
                    "POD position must be between 1 and 3."
            );
        }

        return position;
    }

    private static String requireStorageKey(
            String storageKey
    ) {
        if (
                storageKey == null
                        || storageKey.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "storageKey is required."
            );
        }

        String normalizedStorageKey =
                storageKey.trim();

        if (normalizedStorageKey.length() > 255) {
            throw new IllegalArgumentException(
                    "storageKey must not exceed 255 characters."
            );
        }

        return normalizedStorageKey;
    }

    private static UUID requireId(
            UUID value,
            String fieldName
    ) {
        if (value == null) {
            throw new IllegalArgumentException(
                    fieldName + " is required."
            );
        }

        return value;
    }

    private static Instant requireInstant(
            Instant value,
            String fieldName
    ) {
        if (value == null) {
            throw new IllegalArgumentException(
                    fieldName + " is required."
            );
        }

        return value;
    }
}
