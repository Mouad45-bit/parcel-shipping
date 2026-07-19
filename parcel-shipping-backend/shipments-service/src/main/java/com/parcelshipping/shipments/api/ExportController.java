package com.parcelshipping.shipments.api;

import com.parcelshipping.shipments.api.dto.ExportPageResponse;
import com.parcelshipping.shipments.api.dto.ExportSearchRequest;
import com.parcelshipping.shipments.service.ShipmentExportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
public class ExportController {

    private final ShipmentExportService shipmentExportService;

    public ExportController(
            ShipmentExportService shipmentExportService
    ) {
        this.shipmentExportService =
                shipmentExportService;
    }

    @GetMapping("/api/exports")
    public ExportPageResponse search(
            @RequestParam(name = "client", required = false)
            String client,
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
            @RequestParam(name = "exportDateFrom", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate exportDateFrom,
            @RequestParam(name = "exportDateTo", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate exportDateTo,
            @RequestParam(name = "archived", required = false)
            Boolean archived,
            @RequestParam(name = "page", required = false)
            Integer page,
            @RequestParam(name = "size", required = false)
            Integer size,
            @RequestParam(name = "sortBy", required = false)
            String sortBy,
            @RequestParam(name = "sortDirection", required = false)
            String sortDirection
    ) {
        return shipmentExportService
                .search(
                        new ExportSearchRequest(
                                client,
                                trackingCode,
                                dispatchDateFrom,
                                dispatchDateTo,
                                status,
                                proofOfDelivery,
                                exportDateFrom,
                                exportDateTo,
                                archived,
                                page,
                                size,
                                sortBy,
                                sortDirection
                        )
                );
    }

    @GetMapping("/api/exports/{exportId}/content")
    public ResponseEntity<byte[]> readContent(
            @PathVariable("exportId") UUID exportId
    ) {
        ShipmentExportService.GeneratedExport export =
                shipmentExportService
                        .readExportContent(exportId);

        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_PDF)
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

    @PatchMapping("/api/exports/{exportId}/archive")
    public ResponseEntity<Void> archive(
            @PathVariable("exportId") UUID exportId
    ) {
        shipmentExportService.archive(exportId);

        return ResponseEntity
                .noContent()
                .cacheControl(CacheControl.noStore())
                .build();
    }

    @PatchMapping("/api/exports/{exportId}/unarchive")
    public ResponseEntity<Void> unarchive(
            @PathVariable("exportId") UUID exportId
    ) {
        shipmentExportService.unarchive(exportId);

        return ResponseEntity
                .noContent()
                .cacheControl(CacheControl.noStore())
                .build();
    }
}
