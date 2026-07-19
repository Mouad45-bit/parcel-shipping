package com.parcelshipping.shipments.api;

import com.parcelshipping.shipments.api.dto.MultiplePodExportRequest;
import com.parcelshipping.shipments.service.ShipmentExportService;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class ShipmentExportController {

    private final ShipmentExportService shipmentExportService;

    public ShipmentExportController(
            ShipmentExportService shipmentExportService
    ) {
        this.shipmentExportService =
                shipmentExportService;
    }

    @PostMapping("/api/shipments/{shipmentId}/pod-export")
    public ResponseEntity<byte[]> exportShipment(
            @PathVariable("shipmentId") UUID shipmentId
    ) {
        ShipmentExportService.GeneratedExport export =
                shipmentExportService
                        .exportShipment(shipmentId);

        return binaryResponse(
                export,
                MediaType.APPLICATION_PDF
        );
    }

    @PostMapping("/api/shipments/pod-export")
    public ResponseEntity<byte[]> exportShipments(
            @RequestBody MultiplePodExportRequest request
    ) {
        ShipmentExportService.GeneratedExport export =
                shipmentExportService
                        .exportShipments(request);

        return binaryResponse(
                export,
                MediaType.parseMediaType(
                        "application/zip"
                )
        );
    }

    private ResponseEntity<byte[]> binaryResponse(
            ShipmentExportService.GeneratedExport export,
            MediaType mediaType
    ) {
        return ResponseEntity
                .ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition
                                .attachment()
                                .filename(
                                        export.filename()
                                )
                                .build()
                                .toString()
                )
                .cacheControl(CacheControl.noStore().cachePrivate())
                .header(
                        "X-Content-Type-Options",
                        "nosniff"
                )
                .body(export.content());
    }
}
