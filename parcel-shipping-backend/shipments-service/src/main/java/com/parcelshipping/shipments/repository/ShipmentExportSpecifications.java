package com.parcelshipping.shipments.repository;

import com.parcelshipping.shipments.domain.ProofOfDeliveryStatus;
import com.parcelshipping.shipments.domain.ShipmentExport;
import com.parcelshipping.shipments.domain.ShipmentPod;
import com.parcelshipping.shipments.domain.ShipmentStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalTime;

public final class ShipmentExportSpecifications {

    private ShipmentExportSpecifications() {
    }

    public static Specification<ShipmentExport> archivedEquals(
            boolean archived
    ) {
        return (root, query, builder) ->
                archived
                        ? builder.isNotNull(root.get("archivedAt"))
                        : builder.isNull(root.get("archivedAt"));
    }

    public static Specification<ShipmentExport> clientEquals(
            String client
    ) {
        return (root, query, builder) -> {
            if (client == null || client.isBlank()) {
                return builder.conjunction();
            }

            return builder.equal(
                    root.get("shipment").get("client"),
                    client
            );
        };
    }

    public static Specification<ShipmentExport> trackingCodeContains(
            String trackingCode
    ) {
        return (root, query, builder) -> {
            if (trackingCode == null || trackingCode.isBlank()) {
                return builder.conjunction();
            }

            String pattern =
                    "%"
                            + trackingCode
                            .trim()
                            .toLowerCase()
                            + "%";

            return builder.like(
                    builder.lower(
                            root.get("shipment")
                                    .get("trackingCode")
                    ),
                    pattern
            );
        };
    }

    public static Specification<ShipmentExport> dispatchDateBetween(
            LocalDate from,
            LocalDate to
    ) {
        return dateBetween(
                "dispatchDate",
                from,
                to
        );
    }

    public static Specification<ShipmentExport> exportDateBetween(
            LocalDate from,
            LocalDate to
    ) {
        return (root, query, builder) -> {
            if (from == null && to == null) {
                return builder.conjunction();
            }

            if (from != null && to != null) {
                return builder.between(
                        root.get("generatedAt"),
                        from.atStartOfDay()
                                .atZone(
                                        java.time.ZoneOffset.UTC
                                )
                                .toInstant(),
                        to.atTime(LocalTime.MAX)
                                .atZone(
                                        java.time.ZoneOffset.UTC
                                )
                                .toInstant()
                );
            }

            if (from != null) {
                return builder.greaterThanOrEqualTo(
                        root.get("generatedAt"),
                        from.atStartOfDay()
                                .atZone(
                                        java.time.ZoneOffset.UTC
                                )
                                .toInstant()
                );
            }

            return builder.lessThanOrEqualTo(
                    root.get("generatedAt"),
                    to.atTime(LocalTime.MAX)
                            .atZone(
                                    java.time.ZoneOffset.UTC
                            )
                            .toInstant()
            );
        };
    }

    public static Specification<ShipmentExport> statusEquals(
            ShipmentStatus status
    ) {
        return (root, query, builder) -> {
            if (status == null) {
                return builder.conjunction();
            }

            return builder.equal(
                    root.get("shipment").get("status"),
                    status
            );
        };
    }

    public static Specification<ShipmentExport> proofOfDeliveryCountEquals(
            ProofOfDeliveryStatus proofOfDeliveryStatus
    ) {
        return (root, query, builder) -> {
            if (proofOfDeliveryStatus == null) {
                return builder.conjunction();
            }

            var podCount = query.subquery(Long.class);
            var podRoot = podCount.from(ShipmentPod.class);

            podCount.select(builder.count(podRoot));
            podCount.where(
                    builder.equal(
                            podRoot.get("shipmentId"),
                            root.get("shipmentId")
                    )
            );

            if (proofOfDeliveryStatus == ProofOfDeliveryStatus.AVAILABLE) {
                return builder.greaterThan(podCount, 0L);
            }

            return builder.equal(podCount, 0L);
        };
    }

    private static Specification<ShipmentExport> dateBetween(
            String fieldName,
            LocalDate from,
            LocalDate to
    ) {
        return (root, query, builder) -> {
            if (from == null && to == null) {
                return builder.conjunction();
            }

            jakarta.persistence.criteria.Path<java.time.LocalDateTime> path =
                    root.get("shipment")
                            .get(fieldName);

            if (from != null && to != null) {
                return builder.between(
                        path,
                        from.atStartOfDay(),
                        to.atTime(LocalTime.MAX)
                );
            }

            if (from != null) {
                return builder.greaterThanOrEqualTo(
                        path,
                        from.atStartOfDay()
                );
            }

            return builder.lessThanOrEqualTo(
                    path,
                    to.atTime(LocalTime.MAX)
            );
        };
    }
}
