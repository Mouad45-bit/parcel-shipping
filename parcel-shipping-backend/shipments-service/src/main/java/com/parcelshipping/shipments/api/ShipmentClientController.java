package com.parcelshipping.shipments.api;

import com.parcelshipping.shipments.api.dto.ShipmentClientListResponse;
import com.parcelshipping.shipments.service.ShipmentClientService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shipments/clients")
public class ShipmentClientController {

    private final ShipmentClientService shipmentClientService;

    public ShipmentClientController(
            ShipmentClientService shipmentClientService
    ) {
        this.shipmentClientService =
                shipmentClientService;
    }

    @GetMapping
    public ResponseEntity<ShipmentClientListResponse>
    getClients() {
        return ResponseEntity
                .ok()
                .cacheControl(
                        CacheControl.noStore()
                )
                .header(
                        HttpHeaders.PRAGMA,
                        "no-cache"
                )
                .body(
                        shipmentClientService
                                .getClients()
                );
    }
}
