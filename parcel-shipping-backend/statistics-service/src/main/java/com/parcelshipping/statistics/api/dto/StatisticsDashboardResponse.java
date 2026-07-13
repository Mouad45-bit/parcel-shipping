package com.parcelshipping.statistics.api.dto;

import java.time.Instant;
import java.util.List;

public record StatisticsDashboardResponse(
        Instant generatedAt,
        String client,
        StatisticsSummaryResponse summary,
        List<ShipmentStatusCountResponse> shipmentStatuses,
        List<PodStatusCountResponse> podStatuses,
        List<ShipmentsPeriodResponse> shipmentsByPeriod,
        List<DestinationCountResponse> destinations
) {
}
