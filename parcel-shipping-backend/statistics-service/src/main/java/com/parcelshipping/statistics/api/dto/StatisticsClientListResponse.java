package com.parcelshipping.statistics.api.dto;

import java.util.List;

public record StatisticsClientListResponse(
        List<StatisticsClientResponse> items
) {
}
