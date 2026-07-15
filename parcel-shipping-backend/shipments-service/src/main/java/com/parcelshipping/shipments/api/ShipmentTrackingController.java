package com.parcelshipping.shipments.api;

import com.parcelshipping.shipments.api.dto.ShipmentTrackingResponse;
import com.parcelshipping.shipments.service.ShipmentTrackingService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shipments/tracking")
public class ShipmentTrackingController {

    private final ShipmentTrackingService
            shipmentTrackingService;

    public ShipmentTrackingController(
            ShipmentTrackingService shipmentTrackingService
    ) {
        this.shipmentTrackingService =
                shipmentTrackingService;
    }

    @GetMapping("/{trackingCode}")
    public ResponseEntity<ShipmentTrackingResponse>
    trackShipment(
            @PathVariable("trackingCode")
            String trackingCode
    ) {
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
                        shipmentTrackingService
                                .track(trackingCode)
                );
    }
}
