package com.parcelshipping.shipments.service;

import com.parcelshipping.shipments.api.dto.ShipmentPageResponse;
import com.parcelshipping.shipments.api.dto.ShipmentResponse;
import com.parcelshipping.shipments.api.dto.ShipmentSearchRequest;
import com.parcelshipping.shipments.domain.ProofOfDeliveryStatus;
import com.parcelshipping.shipments.domain.Shipment;
import com.parcelshipping.shipments.domain.ShipmentStatus;
import com.parcelshipping.shipments.repository.ShipmentRepository;
import com.parcelshipping.shipments.repository.ShipmentSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ShipmentService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "trackingCode",
            "dispatchDate",
            "status",
            "statusDate",
            "proofOfDelivery",
            "exportedAt"
    );

    private final ShipmentRepository shipmentRepository;
    private final ShipmentMapper shipmentMapper;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentMapper shipmentMapper
    ) {
        this.shipmentRepository = shipmentRepository;
        this.shipmentMapper = shipmentMapper;
    }

    public ShipmentPageResponse search(ShipmentSearchRequest request) {
        Specification<Shipment> specification = buildSpecification(request);
        PageRequest pageRequest = buildPageRequest(request);

        Page<Shipment> page = shipmentRepository.findAll(specification, pageRequest);

        List<ShipmentResponse> items = page.getContent()
                .stream()
                .map(shipmentMapper::toResponse)
                .toList();

        return new ShipmentPageResponse(
                items,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    private Specification<Shipment> buildSpecification(ShipmentSearchRequest request) {
        ShipmentStatus status = parseStatus(request.status());
        ProofOfDeliveryStatus proofOfDelivery = parseProofOfDelivery(request.proofOfDelivery());

        return ShipmentSpecifications.clientEquals(request.client())
                .and(ShipmentSpecifications.trackingCodeContains(request.trackingCode()))
                .and(ShipmentSpecifications.dispatchDateBetween(request.dispatchDateFrom(), request.dispatchDateTo()))
                .and(ShipmentSpecifications.statusEquals(status))
                .and(ShipmentSpecifications.proofOfDeliveryEquals(proofOfDelivery))
                .and(ShipmentSpecifications.statusDateBetween(request.statusDateFrom(), request.statusDateTo()));
    }

    private PageRequest buildPageRequest(ShipmentSearchRequest request) {
        int page = request.page() == null ? DEFAULT_PAGE : request.page();
        int size = request.size() == null ? DEFAULT_SIZE : request.size();

        String sortBy = resolveSortBy(request.sortBy());
        Sort.Direction direction = resolveSortDirection(request.sortDirection());

        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    private String resolveSortBy(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "dispatchDate";
        }

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new IllegalArgumentException("Unsupported sort field: " + sortBy);
        }

        return sortBy;
    }

    private Sort.Direction resolveSortDirection(String sortDirection) {
        if (sortDirection == null || sortDirection.isBlank()) {
            return Sort.Direction.DESC;
        }

        if ("asc".equalsIgnoreCase(sortDirection)) {
            return Sort.Direction.ASC;
        }

        if ("desc".equalsIgnoreCase(sortDirection)) {
            return Sort.Direction.DESC;
        }

        throw new IllegalArgumentException("Unsupported sort direction: " + sortDirection);
    }

    private ShipmentStatus parseStatus(String status) {
        if (status == null || status.isBlank() || "all".equals(status)) {
            return null;
        }

        return ShipmentStatus.fromApiValue(status);
    }

    private ProofOfDeliveryStatus parseProofOfDelivery(String proofOfDelivery) {
        if (proofOfDelivery == null || proofOfDelivery.isBlank() || "all".equals(proofOfDelivery)) {
            return null;
        }

        return ProofOfDeliveryStatus.fromApiValue(proofOfDelivery);
    }
}