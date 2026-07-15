package com.parcelshipping.shipments.service;

import com.parcelshipping.shipments.api.dto.ShipmentTrackingResponse;
import com.parcelshipping.shipments.domain.Shipment;
import com.parcelshipping.shipments.error.ShipmentNotFoundException;
import com.parcelshipping.shipments.repository.ShipmentPodRepository;
import com.parcelshipping.shipments.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShipmentTrackingService {

    private static final int TRACKING_CODE_MAX_LENGTH =
            40;

    private final ShipmentRepository shipmentRepository;
    private final ShipmentPodRepository shipmentPodRepository;
    private final ShipmentMapper shipmentMapper;

    public ShipmentTrackingService(
            ShipmentRepository shipmentRepository,
            ShipmentPodRepository shipmentPodRepository,
            ShipmentMapper shipmentMapper
    ) {
        this.shipmentRepository =
                shipmentRepository;

        this.shipmentPodRepository =
                shipmentPodRepository;

        this.shipmentMapper =
                shipmentMapper;
    }

    @Transactional(readOnly = true)
    public ShipmentTrackingResponse track(
            String trackingCode
    ) {
        String normalizedTrackingCode =
                normalizeTrackingCode(
                        trackingCode
                );

        Shipment shipment =
                shipmentRepository
                        .findByTrackingCodeIgnoreCase(
                                normalizedTrackingCode
                        )
                        .orElseThrow(() ->
                                new ShipmentNotFoundException(
                                        normalizedTrackingCode
                                )
                        );

        long podCount =
                shipmentPodRepository
                        .countByShipmentId(
                                shipment.getId()
                        );

        return shipmentMapper
                .toTrackingResponse(
                        shipment,
                        podCount
                );
    }

    private String normalizeTrackingCode(
            String trackingCode
    ) {
        if (
                trackingCode == null
                        || trackingCode.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "trackingCode is required."
            );
        }

        String normalizedTrackingCode =
                trackingCode.trim();

        if (
                normalizedTrackingCode.length()
                        > TRACKING_CODE_MAX_LENGTH
        ) {
            throw new IllegalArgumentException(
                    "trackingCode must not exceed "
                            + TRACKING_CODE_MAX_LENGTH
                            + " characters."
            );
        }

        return normalizedTrackingCode;
    }
}
