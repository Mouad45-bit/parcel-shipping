package com.parcelshipping.shipments.repository;

import com.parcelshipping.shipments.domain.ProofOfDeliveryStatus;
import com.parcelshipping.shipments.domain.Shipment;
import com.parcelshipping.shipments.domain.ShipmentStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalTime;

public final class ShipmentSpecifications {

    private ShipmentSpecifications() {
    }

    public static Specification<Shipment> clientEquals(String client) {
        return (root, query, builder) -> builder.equal(root.get("client"), client);
    }

    public static Specification<Shipment> trackingCodeContains(String trackingCode) {
        return (root, query, builder) -> {
            if (trackingCode == null || trackingCode.isBlank()) {
                return builder.conjunction();
            }

            String pattern = "%" + trackingCode.trim().toLowerCase() + "%";

            return builder.like(builder.lower(root.get("trackingCode")), pattern);
        };
    }

    public static Specification<Shipment> dispatchDateBetween(LocalDate from, LocalDate to) {
        return (root, query, builder) -> {
            if (from == null && to == null) {
                return builder.conjunction();
            }

            if (from != null && to != null) {
                return builder.between(
                        root.get("dispatchDate"),
                        from.atStartOfDay(),
                        to.atTime(LocalTime.MAX)
                );
            }

            if (from != null) {
                return builder.greaterThanOrEqualTo(root.get("dispatchDate"), from.atStartOfDay());
            }

            return builder.lessThanOrEqualTo(root.get("dispatchDate"), to.atTime(LocalTime.MAX));
        };
    }

    public static Specification<Shipment> statusDateBetween(LocalDate from, LocalDate to) {
        return (root, query, builder) -> {
            if (from == null && to == null) {
                return builder.conjunction();
            }

            if (from != null && to != null) {
                return builder.between(
                        root.get("statusDate"),
                        from.atStartOfDay(),
                        to.atTime(LocalTime.MAX)
                );
            }

            if (from != null) {
                return builder.greaterThanOrEqualTo(root.get("statusDate"), from.atStartOfDay());
            }

            return builder.lessThanOrEqualTo(root.get("statusDate"), to.atTime(LocalTime.MAX));
        };
    }

    public static Specification<Shipment> statusEquals(ShipmentStatus status) {
        return (root, query, builder) -> {
            if (status == null) {
                return builder.conjunction();
            }

            return builder.equal(root.get("status"), status);
        };
    }

    public static Specification<Shipment> proofOfDeliveryEquals(ProofOfDeliveryStatus proofOfDeliveryStatus) {
        return (root, query, builder) -> {
            if (proofOfDeliveryStatus == null) {
                return builder.conjunction();
            }

            return builder.equal(root.get("proofOfDelivery"), proofOfDeliveryStatus);
        };
    }
}