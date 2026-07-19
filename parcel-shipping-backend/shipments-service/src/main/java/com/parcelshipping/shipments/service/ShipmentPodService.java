package com.parcelshipping.shipments.service;

import com.parcelshipping.shipments.api.dto.PodDocumentPodResponse;
import com.parcelshipping.shipments.api.dto.PodDocumentResponse;
import com.parcelshipping.shipments.api.dto.ShipmentPodItemResponse;
import com.parcelshipping.shipments.api.dto.ShipmentPodsResponse;
import com.parcelshipping.shipments.domain.Shipment;
import com.parcelshipping.shipments.domain.ShipmentPod;
import com.parcelshipping.shipments.error.PodNotAvailableException;
import com.parcelshipping.shipments.error.PodNotFoundException;
import com.parcelshipping.shipments.error.ShipmentNotFoundException;
import com.parcelshipping.shipments.repository.ShipmentPodRepository;
import com.parcelshipping.shipments.repository.ShipmentRepository;
import com.parcelshipping.shipments.storage.ShipmentPodStorage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ShipmentPodService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentPodRepository shipmentPodRepository;
    private final ShipmentPodStorage shipmentPodStorage;

    public ShipmentPodService(
            ShipmentRepository shipmentRepository,
            ShipmentPodRepository shipmentPodRepository,
            ShipmentPodStorage shipmentPodStorage
    ) {
        this.shipmentRepository = shipmentRepository;
        this.shipmentPodRepository = shipmentPodRepository;
        this.shipmentPodStorage = shipmentPodStorage;
    }

    @Transactional(readOnly = true)
    public ShipmentPodsResponse listPods(
            UUID shipmentId
    ) {
        requireShipment(shipmentId);

        List<ShipmentPod> pods =
                findPods(shipmentId);

        List<ShipmentPodItemResponse> items =
                pods.stream()
                        .map(pod -> new ShipmentPodItemResponse(
                                pod.getId(),
                                pod.getPosition(),
                                podContentUrl(
                                        shipmentId,
                                        pod.getId()
                                )
                        ))
                        .toList();

        return new ShipmentPodsResponse(
                shipmentId,
                items.size(),
                items
        );
    }

    @Transactional(readOnly = true)
    public byte[] readPodContent(
            UUID shipmentId,
            UUID podId
    ) {
        requireShipment(shipmentId);

        ShipmentPod pod =
                shipmentPodRepository
                        .findByIdAndShipmentId(
                                podId,
                                shipmentId
                        )
                        .orElseThrow(() ->
                                new PodNotFoundException(
                                        podId
                                )
                        );

        return shipmentPodStorage
                .read(
                        pod.getStorageKey()
                );
    }

    @Transactional(readOnly = true)
    public PodDocumentResponse getPodDocument(
            UUID shipmentId
    ) {
        Shipment shipment =
                requireShipment(shipmentId);

        List<ShipmentPod> pods =
                findPods(shipmentId);

        if (
                pods.isEmpty()
                        || pods.size() > 3
        ) {
            throw new PodNotAvailableException();
        }

        List<PodDocumentPodResponse> podResponses =
                pods.stream()
                        .map(pod -> new PodDocumentPodResponse(
                                pod.getId(),
                                pod.getPosition(),
                                podContentUrl(
                                        shipmentId,
                                        pod.getId()
                                )
                        ))
                        .toList();

        return new PodDocumentResponse(
                shipment.getId(),
                shipment.getClient(),
                shipment.getTrackingCode(),
                shipment.getDestination(),
                shipment.getDispatchDate(),
                shipment.getStatus().apiValue(),
                shipment.getStatusDate(),
                Instant.now(),
                podResponses
        );
    }

    @Transactional(readOnly = true)
    public PodDocumentContent loadPodDocumentContent(
            UUID shipmentId
    ) {
        PodDocumentResponse document =
                getPodDocument(shipmentId);

        List<PodContent> pods =
                document.pods()
                        .stream()
                        .map(pod -> new PodContent(
                                pod.id(),
                                pod.position(),
                                readPodContent(
                                        shipmentId,
                                        pod.id()
                                )
                        ))
                        .toList();

        return new PodDocumentContent(
                document,
                pods
        );
    }

    private Shipment requireShipment(
            UUID shipmentId
    ) {
        return shipmentRepository
                .findById(shipmentId)
                .orElseThrow(() ->
                        new ShipmentNotFoundException(
                                shipmentId
                        )
                );
    }

    private List<ShipmentPod> findPods(
            UUID shipmentId
    ) {
        List<ShipmentPod> pods =
                shipmentPodRepository
                        .findAllByShipmentIdOrderByPositionAsc(
                                shipmentId
                        );

        if (pods.size() > 3) {
            throw new IllegalStateException(
                    "Shipment has more than 3 POD files."
            );
        }

        return pods;
    }

    private String podContentUrl(
            UUID shipmentId,
            UUID podId
    ) {
        return "/api/shipments/"
                + shipmentId
                + "/pods/"
                + podId
                + "/content";
    }

    public record PodContent(
            UUID id,
            int position,
            byte[] content
    ) {
    }

    public record PodDocumentContent(
            PodDocumentResponse document,
            List<PodContent> pods
    ) {
    }
}
