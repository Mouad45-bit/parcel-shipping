package com.parcelshipping.statistics.api;

import com.parcelshipping.statistics.api.dto.StatisticsDashboardResponse;
import com.parcelshipping.statistics.api.dto.StatisticsSearchRequest;
import com.parcelshipping.statistics.service.StatisticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(
            StatisticsService statisticsService
    ) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StatisticsDashboardResponse>
    getDashboard(
            @RequestParam(name = "client")
            String client,

            @RequestParam(
                    name = "trackingCode",
                    required = false
            )
            String trackingCode,

            @RequestParam(
                    name = "dispatchDateFrom",
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate dispatchDateFrom,

            @RequestParam(
                    name = "dispatchDateTo",
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate dispatchDateTo,

            @RequestParam(
                    name = "status",
                    required = false
            )
            String status,

            @RequestParam(
                    name = "proofOfDelivery",
                    required = false
            )
            String proofOfDelivery,

            @RequestParam(
                    name = "statusDateFrom",
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate statusDateFrom,

            @RequestParam(
                    name = "statusDateTo",
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate statusDateTo
    ) {
        StatisticsSearchRequest request =
                new StatisticsSearchRequest(
                        client,
                        trackingCode,
                        dispatchDateFrom,
                        dispatchDateTo,
                        status,
                        proofOfDelivery,
                        statusDateFrom,
                        statusDateTo
                );

        return noStore(
                statisticsService.getDashboard(
                        request
                )
        );
    }

    private <T> ResponseEntity<T> noStore(
            T body
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
                .body(body);
    }
}