package com.parcelshipping.statistics.repository;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;

public record StatisticsQueryParameters(
        String whereClause,
        MapSqlParameterSource parameters
) {
}
