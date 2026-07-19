package com.parcelshipping.shipments.repository;

import com.parcelshipping.shipments.domain.ShipmentExport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ShipmentExportRepository
        extends JpaRepository<ShipmentExport, UUID>,
        JpaSpecificationExecutor<ShipmentExport> {

    Optional<ShipmentExport> findByShipmentId(
            UUID shipmentId
    );
}
