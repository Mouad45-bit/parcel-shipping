package com.parcelshipping.shipments.api;

import com.parcelshipping.shipments.api.dto.ShipmentPageResponse;
import com.parcelshipping.shipments.api.dto.ShipmentSearchRequest;
import com.parcelshipping.shipments.service.ShipmentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping("/api/shipments")
    public ShipmentPageResponse searchShipments(
            @RequestParam(name = "client") String client,

            @RequestParam(name = "trackingCode", required = false)
            String trackingCode,

            @RequestParam(name = "dispatchDateFrom", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dispatchDateFrom,

            @RequestParam(name = "dispatchDateTo", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dispatchDateTo,

            @RequestParam(name = "status", required = false)
            String status,

            @RequestParam(name = "proofOfDelivery", required = false)
            String proofOfDelivery,

            @RequestParam(name = "statusDateFrom", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate statusDateFrom,

            @RequestParam(name = "statusDateTo", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate statusDateTo,

            @RequestParam(name = "page", required = false)
            Integer page,

            @RequestParam(name = "size", required = false)
            Integer size,

            @RequestParam(name = "sortBy", required = false)
            String sortBy,

            @RequestParam(name = "sortDirection", required = false)
            String sortDirection
    ) {
        ShipmentSearchRequest request = new ShipmentSearchRequest(
                client,
                trackingCode,
                dispatchDateFrom,
                dispatchDateTo,
                status,
                proofOfDelivery,
                statusDateFrom,
                statusDateTo,
                page,
                size,
                sortBy,
                sortDirection
        );

        return shipmentService.search(request);
    }
}