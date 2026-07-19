package com.parcelshipping.shipments.repository;

import com.parcelshipping.shipments.domain.ShipmentPod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShipmentPodRepository
        extends JpaRepository<ShipmentPod, UUID> {

    List<ShipmentPod>
    findAllByShipmentIdOrderByPositionAsc(
            UUID shipmentId
    );

    long countByShipmentId(
            UUID shipmentId
    );

    boolean existsByShipmentIdAndPosition(
            UUID shipmentId,
            int position
    );

    Optional<ShipmentPod>
    findByShipmentIdAndPosition(
            UUID shipmentId,
            int position
    );

    Optional<ShipmentPod> findByIdAndShipmentId(
            UUID id,
            UUID shipmentId
    );

    @Query("""
            select p.shipmentId as shipmentId, count(p) as podCount
            from ShipmentPod p
            where p.shipmentId in :shipmentIds
            group by p.shipmentId
            """)
    List<ShipmentPodCountProjection>
    countByShipmentIds(
            Collection<UUID> shipmentIds
    );
}
