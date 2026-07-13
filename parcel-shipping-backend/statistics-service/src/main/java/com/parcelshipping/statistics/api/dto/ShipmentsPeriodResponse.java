package com.parcelshipping.statistics.api.dto;

import java.time.LocalDate;

public record ShipmentsPeriodResponse(
        LocalDate period,
        long count
) {
}
