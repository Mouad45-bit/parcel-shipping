package com.parcelshipping.shipments.service;

import com.parcelshipping.shipments.api.dto.ExportPageResponse;
import com.parcelshipping.shipments.api.dto.ExportResponse;
import com.parcelshipping.shipments.api.dto.ExportSearchRequest;
import com.parcelshipping.shipments.api.dto.MultiplePodExportRequest;
import com.parcelshipping.shipments.domain.ProofOfDeliveryStatus;
import com.parcelshipping.shipments.domain.Shipment;
import com.parcelshipping.shipments.domain.ShipmentExport;
import com.parcelshipping.shipments.domain.ShipmentStatus;
import com.parcelshipping.shipments.error.ShipmentExportNotFoundException;
import com.parcelshipping.shipments.repository.ShipmentExportRepository;
import com.parcelshipping.shipments.repository.ShipmentExportSpecifications;
import com.parcelshipping.shipments.repository.ShipmentPodCountProjection;
import com.parcelshipping.shipments.repository.ShipmentPodRepository;
import com.parcelshipping.shipments.repository.ShipmentRepository;
import com.parcelshipping.shipments.storage.ShipmentExportStorage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ShipmentExportService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;
    private static final int MAXIMUM_BULK_EXPORT_SIZE = 50;

    private static final Map<String, String> SORT_FIELDS =
            Map.of(
                    "trackingCode", "shipment.trackingCode",
                    "dispatchDate", "shipment.dispatchDate",
                    "status", "shipment.status",
                    "statusDate", "shipment.statusDate",
                    "generatedAt", "generatedAt",
                    "archivedAt", "archivedAt"
            );

    private final ShipmentPodService shipmentPodService;
    private final PodPdfRenderer podPdfRenderer;
    private final ShipmentExportStorage shipmentExportStorage;
    private final ShipmentExportRepository shipmentExportRepository;
    private final ShipmentPodRepository shipmentPodRepository;
    private final ShipmentRepository shipmentRepository;

    public ShipmentExportService(
            ShipmentPodService shipmentPodService,
            PodPdfRenderer podPdfRenderer,
            ShipmentExportStorage shipmentExportStorage,
            ShipmentExportRepository shipmentExportRepository,
            ShipmentPodRepository shipmentPodRepository,
            ShipmentRepository shipmentRepository
    ) {
        this.shipmentPodService = shipmentPodService;
        this.podPdfRenderer = podPdfRenderer;
        this.shipmentExportStorage = shipmentExportStorage;
        this.shipmentExportRepository = shipmentExportRepository;
        this.shipmentPodRepository = shipmentPodRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @Transactional
    public GeneratedExport exportShipment(
            UUID shipmentId
    ) {
        ShipmentPodService.PodDocumentContent documentContent =
                shipmentPodService
                        .loadPodDocumentContent(shipmentId);

        byte[] pdfContent =
                podPdfRenderer.render(documentContent);

        Instant generatedAt = Instant.now();
        String newStorageKey =
                shipmentExportStorage
                        .createStorageKey(
                                shipmentId,
                                generatedAt
                        );

        shipmentExportStorage.write(
                newStorageKey,
                pdfContent
        );

        String previousStorageKey = null;

        try {
            ShipmentExport shipmentExport =
                    shipmentExportRepository
                            .findByShipmentId(shipmentId)
                            .orElse(null);

            if (shipmentExport == null) {
                shipmentExport =
                        ShipmentExport.create(
                                shipmentId,
                                newStorageKey,
                                generatedAt
                        );
            } else {
                previousStorageKey =
                        shipmentExport
                                .getStorageKey();

                shipmentExport.regenerate(
                        newStorageKey,
                        generatedAt
                );
            }

            shipmentExportRepository
                    .saveAndFlush(
                            shipmentExport
                    );

            Shipment shipment =
                    shipmentRepository
                            .getReferenceById(
                                    shipmentId
                            );

            shipment.markExportedAt(
                    LocalDateTime.ofInstant(
                            generatedAt,
                            ZoneOffset.UTC
                    )
            );
        } catch (RuntimeException exception) {
            shipmentExportStorage
                    .deleteIfExists(
                            newStorageKey
                    );

            throw exception;
        }

        if (
                previousStorageKey != null
                        && !previousStorageKey.equals(
                                newStorageKey
                        )
        ) {
            shipmentExportStorage
                    .deleteIfExists(
                            previousStorageKey
                    );
        }

        return new GeneratedExport(
                pdfContent,
                buildPdfFilename(
                        documentContent
                                .document()
                                .trackingCode()
                )
        );
    }

    @Transactional
    public GeneratedExport exportShipments(
            MultiplePodExportRequest request
    ) {
        List<UUID> shipmentIds =
                validateBulkExportRequest(request);

        try (
                ByteArrayOutputStream output =
                        new ByteArrayOutputStream();
                ZipOutputStream zip =
                        new ZipOutputStream(output)
        ) {
            Set<String> usedEntryNames =
                    new HashSet<>();

            for (UUID shipmentId : shipmentIds) {
                GeneratedExport generatedExport =
                        exportShipment(shipmentId);

                String entryName =
                        uniqueEntryName(
                                generatedExport.filename(),
                                usedEntryNames
                        );

                ZipEntry entry =
                        new ZipEntry(entryName);

                zip.putNextEntry(entry);
                zip.write(generatedExport.content());
                zip.closeEntry();
            }

            zip.finish();

            return new GeneratedExport(
                    output.toByteArray(),
                    "pod-exports.zip"
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to create the POD export archive.",
                    exception
            );
        }
    }

    @Transactional(readOnly = true)
    public ExportPageResponse search(
            ExportSearchRequest request
    ) {
        Specification<ShipmentExport> specification =
                buildSpecification(request);

        Page<ShipmentExport> page =
                shipmentExportRepository
                        .findAll(
                                specification,
                                buildPageRequest(request)
                        );

        Map<UUID, Long> podCounts =
                loadPodCounts(
                        page.getContent()
                );

        List<ExportResponse> items =
                page.getContent()
                        .stream()
                        .map(export -> toResponse(
                                export,
                                podCounts.getOrDefault(
                                        export.getShipmentId(),
                                        0L
                                )
                        ))
                        .toList();

        return new ExportPageResponse(
                items,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    @Transactional(readOnly = true)
    public GeneratedExport readExportContent(
            UUID exportId
    ) {
        ShipmentExport export =
                findExport(exportId);

        return new GeneratedExport(
                shipmentExportStorage
                        .read(
                                export.getStorageKey()
                        ),
                buildPdfFilename(
                        export.getShipment()
                                .getTrackingCode()
                )
        );
    }

    @Transactional
    public void archive(
            UUID exportId
    ) {
        ShipmentExport export =
                findExport(exportId);

        if (!export.isArchived()) {
            export.archive(Instant.now());
        }
    }

    @Transactional
    public void unarchive(
            UUID exportId
    ) {
        ShipmentExport export =
                findExport(exportId);

        if (export.isArchived()) {
            export.unarchive();
        }
    }

    private ShipmentExport findExport(
            UUID exportId
    ) {
        return shipmentExportRepository
                .findById(exportId)
                .orElseThrow(() ->
                        new ShipmentExportNotFoundException(
                                exportId
                        )
                );
    }

    private Specification<ShipmentExport> buildSpecification(
            ExportSearchRequest request
    ) {
        ShipmentStatus status =
                parseStatus(request.status());

        ProofOfDeliveryStatus proofOfDelivery =
                parseProofOfDelivery(
                        request.proofOfDelivery()
                );

        return ShipmentExportSpecifications
                .archivedEquals(
                        Boolean.TRUE.equals(
                                request.archived()
                        )
                )
                .and(ShipmentExportSpecifications.clientEquals(request.client()))
                .and(ShipmentExportSpecifications.trackingCodeContains(request.trackingCode()))
                .and(ShipmentExportSpecifications.dispatchDateBetween(request.dispatchDateFrom(), request.dispatchDateTo()))
                .and(ShipmentExportSpecifications.statusEquals(status))
                .and(ShipmentExportSpecifications.proofOfDeliveryCountEquals(proofOfDelivery))
                .and(ShipmentExportSpecifications.exportDateBetween(request.exportDateFrom(), request.exportDateTo()));
    }

    private PageRequest buildPageRequest(
            ExportSearchRequest request
    ) {
        int page =
                request.page() == null
                        ? DEFAULT_PAGE
                        : request.page();

        int size =
                request.size() == null
                        ? DEFAULT_SIZE
                        : request.size();

        if (page < 0 || size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Invalid pagination parameters."
            );
        }

        String sortBy =
                request.sortBy() == null
                        || request.sortBy().isBlank()
                        ? "generatedAt"
                        : request.sortBy();

        String sortField =
                SORT_FIELDS.get(sortBy);

        if (sortField == null) {
            throw new IllegalArgumentException(
                    "Unsupported sort field: "
                            + sortBy
            );
        }

        Sort.Direction direction =
                "asc".equalsIgnoreCase(
                        request.sortDirection()
                )
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        if (
                request.sortDirection() != null
                        && !request.sortDirection()
                        .isBlank()
                        && !"asc".equalsIgnoreCase(
                        request.sortDirection()
                )
                        && !"desc".equalsIgnoreCase(
                        request.sortDirection()
                )
        ) {
            throw new IllegalArgumentException(
                    "Unsupported sort direction: "
                            + request.sortDirection()
            );
        }

        return PageRequest.of(
                page,
                size,
                Sort.by(direction, sortField)
        );
    }

    private ExportResponse toResponse(
            ShipmentExport export,
            long podCount
    ) {
        Shipment shipment =
                export.getShipment();

        return new ExportResponse(
                export.getId(),
                export.getShipmentId(),
                shipment.getClient(),
                shipment.getTrackingCode(),
                shipment.getDestination(),
                shipment.getDispatchDate(),
                shipment.getStatus().apiValue(),
                shipment.getStatusDate(),
                podCount > 0
                        ? "available"
                        : "missing",
                podCount,
                export.getGeneratedAt(),
                export.getArchivedAt(),
                "/api/exports/"
                        + export.getId()
                        + "/content"
        );
    }

    private Map<UUID, Long> loadPodCounts(
            List<ShipmentExport> exports
    ) {
        if (exports.isEmpty()) {
            return Map.of();
        }

        return shipmentPodRepository
                .countByShipmentIds(
                        exports.stream()
                                .map(ShipmentExport::getShipmentId)
                                .toList()
                )
                .stream()
                .collect(Collectors.toMap(
                        ShipmentPodCountProjection::getShipmentId,
                        ShipmentPodCountProjection::getPodCount
                ));
    }

    private List<UUID> validateBulkExportRequest(
            MultiplePodExportRequest request
    ) {
        if (
                request == null
                        || request.shipmentIds() == null
                        || request.shipmentIds().isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "shipmentIds is required."
            );
        }

        if (
                request.shipmentIds().size()
                        > MAXIMUM_BULK_EXPORT_SIZE
        ) {
            throw new IllegalArgumentException(
                    "Too many shipments requested."
            );
        }

        Set<UUID> uniqueIds =
                new HashSet<>(
                        request.shipmentIds()
                );

        if (
                uniqueIds.size()
                        != request.shipmentIds().size()
        ) {
            throw new IllegalArgumentException(
                    "shipmentIds must not contain duplicates."
            );
        }

        return List.copyOf(
                request.shipmentIds()
        );
    }

    private ShipmentStatus parseStatus(
            String status
    ) {
        if (
                status == null
                        || status.isBlank()
                        || "all".equals(status)
        ) {
            return null;
        }

        return ShipmentStatus.fromApiValue(status);
    }

    private ProofOfDeliveryStatus parseProofOfDelivery(
            String proofOfDelivery
    ) {
        if (
                proofOfDelivery == null
                        || proofOfDelivery.isBlank()
                        || "all".equals(proofOfDelivery)
        ) {
            return null;
        }

        return ProofOfDeliveryStatus
                .fromApiValue(
                        proofOfDelivery
                );
    }

    private String buildPdfFilename(
            String trackingCode
    ) {
        return sanitizeFilename(trackingCode)
                + "-pod.pdf";
    }

    private String uniqueEntryName(
            String filename,
            Set<String> usedEntryNames
    ) {
        String safeFilename =
                sanitizeFilename(filename);

        String candidate = safeFilename;
        int counter = 2;

        while (!usedEntryNames.add(candidate)) {
            candidate =
                    safeFilename.replace(
                            ".pdf",
                            "-"
                                    + counter
                                    + ".pdf"
                    );
            counter++;
        }

        return candidate;
    }

    private String sanitizeFilename(
            String value
    ) {
        return value
                .replaceAll(
                        "[^A-Za-z0-9._-]",
                        "_"
                );
    }

    public record GeneratedExport(
            byte[] content,
            String filename
    ) {
    }
}
