package com.parcelshipping.statistics.service;

import com.parcelshipping.statistics.api.dto.StatisticsClientListResponse;
import com.parcelshipping.statistics.api.dto.StatisticsClientResponse;
import com.parcelshipping.statistics.api.dto.StatisticsDashboardResponse;
import com.parcelshipping.statistics.api.dto.StatisticsSearchRequest;
import com.parcelshipping.statistics.api.dto.StatisticsSummaryResponse;
import com.parcelshipping.statistics.error.StatisticsClientNotFoundException;
import com.parcelshipping.statistics.repository.StatisticsQueryBuilder;
import com.parcelshipping.statistics.repository.StatisticsQueryParameters;
import com.parcelshipping.statistics.repository.StatisticsRepository;
import com.parcelshipping.statistics.repository.StatisticsSummarySnapshot;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private final StatisticsRepository statisticsRepository;
    private final StatisticsQueryBuilder statisticsQueryBuilder;

    public StatisticsService(
            StatisticsRepository statisticsRepository,
            StatisticsQueryBuilder statisticsQueryBuilder
    ) {
        this.statisticsRepository =
                statisticsRepository;

        this.statisticsQueryBuilder =
                statisticsQueryBuilder;
    }

    @Transactional(readOnly = true)
    public StatisticsClientListResponse getClients() {
        List<StatisticsClientResponse> clients =
                statisticsRepository
                        .findClients()
                        .stream()
                        .map(client ->
                                new StatisticsClientResponse(
                                        client,
                                        formatClientLabel(
                                                client
                                        )
                                )
                        )
                        .toList();

        return new StatisticsClientListResponse(
                clients
        );
    }

    @Transactional(
            readOnly = true,
            isolation = Isolation.REPEATABLE_READ
    )
    public StatisticsDashboardResponse getDashboard(
            StatisticsSearchRequest request
    ) {
        StatisticsQueryParameters query =
                statisticsQueryBuilder.build(
                        request
                );

        if (
                !statisticsRepository.clientExists(
                        request.client()
                )
        ) {
            throw new StatisticsClientNotFoundException(
                    request.client()
            );
        }

        StatisticsSummarySnapshot snapshot =
                statisticsRepository.findSummary(
                        query
                );

        StatisticsSummaryResponse summary =
                new StatisticsSummaryResponse(
                        snapshot.totalShipments(),
                        snapshot.exportedPodCount(),
                        snapshot.pendingPodExportCount()
                );

        return new StatisticsDashboardResponse(
                snapshot.generatedAt(),
                request.client(),
                summary,

                List.copyOf(
                        statisticsRepository
                                .findShipmentStatusCounts(
                                        query
                                )
                ),

                List.copyOf(
                        statisticsRepository
                                .findPodStatusCounts(
                                        query
                                )
                ),

                List.copyOf(
                        statisticsRepository
                                .findShipmentsByPeriod(
                                        query
                                )
                ),

                List.copyOf(
                        statisticsRepository
                                .findDestinationCounts(
                                        query
                                )
                )
        );
    }

    private String formatClientLabel(
            String client
    ) {
        return Arrays
                .stream(
                        client.split(
                                "[\\s_-]+"
                        )
                )
                .filter(part ->
                        !part.isBlank()
                )
                .map(this::capitalize)
                .collect(
                        Collectors.joining(" ")
                );
    }

    private String capitalize(
            String value
    ) {
        if (value.isEmpty()) {
            return value;
        }

        return value
                .substring(0, 1)
                .toUpperCase(Locale.ROOT)
                + value
                .substring(1)
                .toLowerCase(Locale.ROOT);
    }
}
