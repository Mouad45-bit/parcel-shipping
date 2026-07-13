package com.parcelshipping.statistics.api.dto;

public record StatisticsSummaryResponse(
        long totalShipments,
        long exportedPodCount,
        long pendingPodExportCount
) {
}
