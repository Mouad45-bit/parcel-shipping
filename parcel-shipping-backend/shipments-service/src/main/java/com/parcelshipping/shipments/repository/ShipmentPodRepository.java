package com.parcelshipping.shipments.repository;

import com.parcelshipping.shipments.domain.ShipmentPod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
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
}
