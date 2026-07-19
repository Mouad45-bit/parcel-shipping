package com.parcelshipping.shipments.api;

import com.parcelshipping.shipments.api.dto.PodDocumentResponse;
import com.parcelshipping.shipments.api.dto.ShipmentPodsResponse;
import com.parcelshipping.shipments.domain.ShipmentPod;
import com.parcelshipping.shipments.service.ShipmentPodService;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class ShipmentPodController {

    private final ShipmentPodService shipmentPodService;

    public ShipmentPodController(
            ShipmentPodService shipmentPodService
    ) {
        this.shipmentPodService =
                shipmentPodService;
    }

    @GetMapping("/api/shipments/{shipmentId}/pods")
    public ResponseEntity<ShipmentPodsResponse> listPods(
            @PathVariable("shipmentId") UUID shipmentId
    ) {
        return ResponseEntity
                .ok()
                .cacheControl(CacheControl.noStore())
                .body(
                        shipmentPodService
                                .listPods(shipmentId)
                );
    }

    @GetMapping("/api/shipments/{shipmentId}/pods/{podId}/content")
    public ResponseEntity<byte[]> readPodContent(
            @PathVariable("shipmentId") UUID shipmentId,
            @PathVariable("podId") UUID podId
    ) {
        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.parseMediaType(
                                ShipmentPod.PNG_MIME_TYPE
                        )
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition
                                .inline()
                                .build()
                                .toString()
                )
                .cacheControl(CacheControl.noCache().cachePrivate())
                .header(
                        "X-Content-Type-Options",
                        "nosniff"
                )
                .body(
                        shipmentPodService
                                .readPodContent(
                                        shipmentId,
                                        podId
                                )
                );
    }

    @GetMapping("/api/shipments/{shipmentId}/pod-document")
    public ResponseEntity<PodDocumentResponse> getPodDocument(
            @PathVariable("shipmentId") UUID shipmentId
    ) {
        return ResponseEntity
                .ok()
                .cacheControl(CacheControl.noStore())
                .body(
                        shipmentPodService
                                .getPodDocument(
                                        shipmentId
                                )
                );
    }
}
