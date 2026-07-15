package com.parcelshipping.statistics.repository;

import com.parcelshipping.statistics.api.dto.DestinationCountResponse;
import com.parcelshipping.statistics.api.dto.PodStatusCountResponse;
import com.parcelshipping.statistics.api.dto.ShipmentStatusCountResponse;
import com.parcelshipping.statistics.api.dto.ShipmentsPeriodResponse;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Repository
public class StatisticsRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public StatisticsRepository(
            NamedParameterJdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean clientExists(
            String client
    ) {
        String sql = """
                SELECT EXISTS (
                    SELECT 1
                    FROM shipments
                    WHERE client = :client
                )
                """;

        Boolean exists =
                jdbcTemplate.queryForObject(
                        sql,
                        new MapSqlParameterSource(
                                "client",
                                client
                        ),
                        Boolean.class
                );

        return Boolean.TRUE.equals(exists);
    }

    public StatisticsSummarySnapshot findSummary(
            StatisticsQueryParameters query
    ) {
        String sql = """
                SELECT
                    CURRENT_TIMESTAMP AS generated_at,
                    COUNT(*) AS total_shipments,
                    COUNT(*) FILTER (
                        WHERE exported_at IS NOT NULL
                    ) AS exported_pod_count,
                    COUNT(*) FILTER (
                        WHERE exported_at IS NULL
                    ) AS pending_pod_export_count
                FROM shipments
                %s
                """.formatted(
                query.whereClause()
        );

        StatisticsSummarySnapshot snapshot =
                jdbcTemplate.queryForObject(
                        sql,
                        query.parameters(),
                        (resultSet, rowNumber) ->
                                new StatisticsSummarySnapshot(
                                        resultSet
                                                .getTimestamp(
                                                        "generated_at"
                                                )
                                                .toInstant(),

                                        resultSet.getLong(
                                                "total_shipments"
                                        ),

                                        resultSet.getLong(
                                                "exported_pod_count"
                                        ),

                                        resultSet.getLong(
                                                "pending_pod_export_count"
                                        )
                                )
                );

        return Objects.requireNonNull(
                snapshot,
                "Statistics summary must not be null"
        );
    }

    public List<ShipmentStatusCountResponse>
    findShipmentStatusCounts(
            StatisticsQueryParameters query
    ) {
        String sql = """
                SELECT
                    LOWER(
                        REPLACE(status, '_', '-')
                    ) AS api_status,
                    COUNT(*) AS item_count
                FROM shipments
                %s
                GROUP BY status
                ORDER BY CASE status
                    WHEN 'CREATED' THEN 1
                    WHEN 'IN_TRANSIT' THEN 2
                    WHEN 'DELIVERED' THEN 3
                    WHEN 'FAILED_DELIVERY' THEN 4
                    WHEN 'RETURNED' THEN 5
                    ELSE 6
                END
                """.formatted(
                query.whereClause()
        );

        return jdbcTemplate.query(
                sql,
                query.parameters(),
                (resultSet, rowNumber) ->
                        new ShipmentStatusCountResponse(
                                resultSet.getString(
                                        "api_status"
                                ),
                                resultSet.getLong(
                                        "item_count"
                                )
                        )
        );
    }

    public List<PodStatusCountResponse>
    findPodStatusCounts(
            StatisticsQueryParameters query
    ) {
        String sql = """
                SELECT
                    LOWER(proof_of_delivery)
                        AS api_proof_of_delivery,
                    COUNT(*) AS item_count
                FROM shipments
                %s
                GROUP BY proof_of_delivery
                ORDER BY CASE proof_of_delivery
                    WHEN 'AVAILABLE' THEN 1
                    WHEN 'MISSING' THEN 2
                    ELSE 3
                END
                """.formatted(
                query.whereClause()
        );

        return jdbcTemplate.query(
                sql,
                query.parameters(),
                (resultSet, rowNumber) ->
                        new PodStatusCountResponse(
                                resultSet.getString(
                                        "api_proof_of_delivery"
                                ),
                                resultSet.getLong(
                                        "item_count"
                                )
                        )
        );
    }

    public List<ShipmentsPeriodResponse>
    findShipmentsByPeriod(
            StatisticsQueryParameters query
    ) {
        String sql = """
                SELECT
                    dispatch_date::date AS period,
                    COUNT(*) AS item_count
                FROM shipments
                %s
                GROUP BY dispatch_date::date
                ORDER BY period
                """.formatted(
                query.whereClause()
        );

        return jdbcTemplate.query(
                sql,
                query.parameters(),
                (resultSet, rowNumber) ->
                        new ShipmentsPeriodResponse(
                                resultSet.getObject(
                                        "period",
                                        LocalDate.class
                                ),
                                resultSet.getLong(
                                        "item_count"
                                )
                        )
        );
    }

    public List<DestinationCountResponse>
    findDestinationCounts(
            StatisticsQueryParameters query
    ) {
        String sql = """
                SELECT
                    destination,
                    COUNT(*) AS item_count
                FROM shipments
                %s
                GROUP BY destination
                ORDER BY
                    item_count DESC,
                    destination ASC
                """.formatted(
                query.whereClause()
        );

        return jdbcTemplate.query(
                sql,
                query.parameters(),
                (resultSet, rowNumber) ->
                        new DestinationCountResponse(
                                resultSet.getString(
                                        "destination"
                                ),
                                resultSet.getLong(
                                        "item_count"
                                )
                        )
        );
    }
}
