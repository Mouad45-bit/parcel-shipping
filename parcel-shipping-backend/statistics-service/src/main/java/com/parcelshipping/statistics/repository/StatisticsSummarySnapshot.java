package com.parcelshipping.statistics.repository;

import java.time.Instant;

public record StatisticsSummarySnapshot(
        Instant generatedAt,
        long totalShipments,
        long exportedPodCount,
        long pendingPodExportCount
) {
}
