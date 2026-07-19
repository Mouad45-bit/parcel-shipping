package com.parcelshipping.shipments.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    private UUID id;

    @Column(name = "client", nullable = false, length = 80)
    private String client;

    @Column(name = "tracking_code", nullable = false, unique = true, length = 40)
    private String trackingCode;

    @Column(name = "dispatch_date", nullable = false)
    private LocalDateTime dispatchDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ShipmentStatus status;

    @Column(name = "status_date", nullable = false)
    private LocalDateTime statusDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "proof_of_delivery", nullable = false, length = 30)
    private ProofOfDeliveryStatus proofOfDelivery;

    @Column(name = "exported_at")
    private LocalDateTime exportedAt;

    @Column(name = "destination", nullable = false, length = 120)
    private String destination;

    protected Shipment() {
    }

    public UUID getId() {
        return id;
    }

    public String getClient() {
        return client;
    }

    public String getTrackingCode() {
        return trackingCode;
    }

    public LocalDateTime getDispatchDate() {
        return dispatchDate;
    }

    public ShipmentStatus getStatus() {
        return status;
    }

    public LocalDateTime getStatusDate() {
        return statusDate;
    }

    public ProofOfDeliveryStatus getProofOfDelivery() {
        return proofOfDelivery;
    }

    public LocalDateTime getExportedAt() {
        return exportedAt;
    }

    public String getDestination() {
        return destination;
    }

    public void markExportedAt(
            LocalDateTime exportedAt
    ) {
        if (exportedAt == null) {
            throw new IllegalArgumentException(
                    "exportedAt is required."
            );
        }

        this.exportedAt = exportedAt;
    }
}
