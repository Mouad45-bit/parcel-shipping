package com.parcelshipping.shipments.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shipment_exports")
public class ShipmentExport {

    @Id
    private UUID id;

    @Column(
            name = "shipment_id",
            nullable = false,
            unique = true
    )
    private UUID shipmentId;

    @Column(
            name = "storage_key",
            nullable = false,
            unique = true,
            length = 255
    )
    private String storageKey;

    @Column(
            name = "generated_at",
            nullable = false
    )
    private Instant generatedAt;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "shipment_id",
            insertable = false,
            updatable = false
    )
    private Shipment shipment;

    protected ShipmentExport() {
    }

    private ShipmentExport(
            UUID id,
            UUID shipmentId,
            String storageKey,
            Instant generatedAt
    ) {
        this.id = requireId(id, "id");
        this.shipmentId =
                requireId(
                        shipmentId,
                        "shipmentId"
                );

        this.storageKey =
                requireStorageKey(storageKey);

        this.generatedAt =
                requireInstant(
                        generatedAt,
                        "generatedAt"
                );

        this.archivedAt = null;
    }

    public static ShipmentExport create(
            UUID shipmentId,
            String storageKey,
            Instant generatedAt
    ) {
        return new ShipmentExport(
                UUID.randomUUID(),
                shipmentId,
                storageKey,
                generatedAt
        );
    }

    public void regenerate(
            String storageKey,
            Instant generatedAt
    ) {
        this.storageKey =
                requireStorageKey(storageKey);

        this.generatedAt =
                requireInstant(
                        generatedAt,
                        "generatedAt"
                );

        this.archivedAt = null;
    }

    public void archive(
            Instant archivedAt
    ) {
        Instant validatedArchivedAt =
                requireInstant(
                        archivedAt,
                        "archivedAt"
                );

        if (
                validatedArchivedAt
                        .isBefore(generatedAt)
        ) {
            throw new IllegalArgumentException(
                    "archivedAt must not be before generatedAt."
            );
        }

        this.archivedAt =
                validatedArchivedAt;
    }

    public void unarchive() {
        this.archivedAt = null;
    }

    public UUID getId() {
        return id;
    }

    public UUID getShipmentId() {
        return shipmentId;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public Instant getArchivedAt() {
        return archivedAt;
    }

    public boolean isArchived() {
        return archivedAt != null;
    }

    public Shipment getShipment() {
        return shipment;
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

    private static String requireStorageKey(
            String value
    ) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    "storageKey is required."
            );
        }

        String normalizedValue = value.trim();

        if (normalizedValue.length() > 255) {
            throw new IllegalArgumentException(
                    "storageKey must not exceed 255 characters."
            );
        }

        return normalizedValue;
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
