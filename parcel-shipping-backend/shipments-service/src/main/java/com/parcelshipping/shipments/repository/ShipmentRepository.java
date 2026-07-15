package com.parcelshipping.shipments.repository;

import com.parcelshipping.shipments.domain.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShipmentRepository
                extends JpaRepository<Shipment, UUID>,
                JpaSpecificationExecutor<Shipment> {

        @Query(value = """
                        SELECT client
                        FROM (
                            SELECT DISTINCT client
                            FROM shipments
                        ) AS distinct_clients
                        ORDER BY LOWER(client), client
                        """, nativeQuery = true)
        List<String> findDistinctClients();

        Optional<Shipment> findByTrackingCodeIgnoreCase(
                        String trackingCode);
}