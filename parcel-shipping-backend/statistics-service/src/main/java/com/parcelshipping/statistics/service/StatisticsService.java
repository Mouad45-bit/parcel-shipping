package com.parcelshipping.statistics.service;

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

import java.util.List;

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
}
