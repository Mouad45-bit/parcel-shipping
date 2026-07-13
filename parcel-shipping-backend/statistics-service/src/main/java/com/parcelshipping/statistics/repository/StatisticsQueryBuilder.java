package com.parcelshipping.statistics.repository;

import com.parcelshipping.statistics.api.dto.StatisticsSearchRequest;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class StatisticsQueryBuilder {

    public StatisticsQueryParameters build(
            StatisticsSearchRequest request
    ) {
        List<String> predicates =
                new ArrayList<>();

        MapSqlParameterSource parameters =
                new MapSqlParameterSource();

        predicates.add(
                "client = :client"
        );

        parameters.addValue(
                "client",
                request.client()
        );

        addTrackingCodeFilter(
                request,
                predicates,
                parameters
        );

        addDispatchDateFilters(
                request,
                predicates,
                parameters
        );

        addStatusFilter(
                request,
                predicates,
                parameters
        );

        addProofOfDeliveryFilter(
                request,
                predicates,
                parameters
        );

        addStatusDateFilters(
                request,
                predicates,
                parameters
        );

        String whereClause =
                "WHERE "
                        + String.join(
                                "\n  AND ",
                                predicates
                        );

        return new StatisticsQueryParameters(
                whereClause,
                parameters
        );
    }

    private void addTrackingCodeFilter(
            StatisticsSearchRequest request,
            List<String> predicates,
            MapSqlParameterSource parameters
    ) {
        if (request.trackingCode() == null) {
            return;
        }

        String escapedTrackingCode =
                escapeLikePattern(
                        request
                                .trackingCode()
                                .toLowerCase(
                                        Locale.ROOT
                                )
                );

        predicates.add(
                "LOWER(tracking_code) "
                        + "LIKE :trackingCode ESCAPE '!'"
        );

        parameters.addValue(
                "trackingCode",
                "%" + escapedTrackingCode + "%"
        );
    }

    private void addDispatchDateFilters(
            StatisticsSearchRequest request,
            List<String> predicates,
            MapSqlParameterSource parameters
    ) {
        if (request.dispatchDateFrom() != null) {
            predicates.add(
                    "dispatch_date >= :dispatchDateFrom"
            );

            parameters.addValue(
                    "dispatchDateFrom",
                    request
                            .dispatchDateFrom()
                            .atStartOfDay()
            );
        }

        if (request.dispatchDateTo() != null) {
            predicates.add(
                    "dispatch_date < :dispatchDateToExclusive"
            );

            parameters.addValue(
                    "dispatchDateToExclusive",
                    request
                            .dispatchDateTo()
                            .plusDays(1)
                            .atStartOfDay()
            );
        }
    }

    private void addStatusFilter(
            StatisticsSearchRequest request,
            List<String> predicates,
            MapSqlParameterSource parameters
    ) {
        String databaseStatus =
                parseShipmentStatus(
                        request.status()
                );

        if (databaseStatus == null) {
            return;
        }

        predicates.add(
                "status = :status"
        );

        parameters.addValue(
                "status",
                databaseStatus
        );
    }

    private void addProofOfDeliveryFilter(
            StatisticsSearchRequest request,
            List<String> predicates,
            MapSqlParameterSource parameters
    ) {
        String databaseProofOfDelivery =
                parseProofOfDelivery(
                        request.proofOfDelivery()
                );

        if (databaseProofOfDelivery == null) {
            return;
        }

        predicates.add(
                "proof_of_delivery = :proofOfDelivery"
        );

        parameters.addValue(
                "proofOfDelivery",
                databaseProofOfDelivery
        );
    }

    private void addStatusDateFilters(
            StatisticsSearchRequest request,
            List<String> predicates,
            MapSqlParameterSource parameters
    ) {
        if (request.statusDateFrom() != null) {
            predicates.add(
                    "status_date >= :statusDateFrom"
            );

            parameters.addValue(
                    "statusDateFrom",
                    request
                            .statusDateFrom()
                            .atStartOfDay()
            );
        }

        if (request.statusDateTo() != null) {
            predicates.add(
                    "status_date < :statusDateToExclusive"
            );

            parameters.addValue(
                    "statusDateToExclusive",
                    request
                            .statusDateTo()
                            .plusDays(1)
                            .atStartOfDay()
            );
        }
    }

    private String parseShipmentStatus(
            String status
    ) {
        if (status == null) {
            return null;
        }

        return switch (
                status.toLowerCase(Locale.ROOT)
        ) {
            case "all" -> null;
            case "created" -> "CREATED";
            case "in-transit" -> "IN_TRANSIT";
            case "delivered" -> "DELIVERED";
            case "failed-delivery" ->
                    "FAILED_DELIVERY";
            case "returned" -> "RETURNED";

            default -> throw new IllegalArgumentException(
                    "Unsupported shipment status: "
                            + status
            );
        };
    }

    private String parseProofOfDelivery(
            String proofOfDelivery
    ) {
        if (proofOfDelivery == null) {
            return null;
        }

        return switch (
                proofOfDelivery.toLowerCase(
                        Locale.ROOT
                )
        ) {
            case "all" -> null;
            case "available" -> "AVAILABLE";
            case "missing" -> "MISSING";

            default -> throw new IllegalArgumentException(
                    "Unsupported proof of delivery status: "
                            + proofOfDelivery
            );
        };
    }

    private String escapeLikePattern(
            String value
    ) {
        return value
                .replace("!", "!!")
                .replace("%", "!%")
                .replace("_", "!_");
    }
}
