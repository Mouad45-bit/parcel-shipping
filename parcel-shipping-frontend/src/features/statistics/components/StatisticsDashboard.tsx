"use client";

import { UserRound, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { PageCard } from "@/components/ui/PageCard";
import {
  initialShipmentFilters,
  type ShipmentFilters,
} from "@/features/shipments/types/shipment-filters";
import { PodStatusChart } from "@/features/statistics/components/PodStatusChart";
import { ShipmentStatusChart } from "@/features/statistics/components/ShipmentStatusChart";
import { ShipmentsTimelineChart } from "@/features/statistics/components/ShipmentsTimelineChart";
import { StatisticsFilters } from "@/features/statistics/components/StatisticsFilters";
import { StatisticsSummary } from "@/features/statistics/components/StatisticsSummary";
import { statisticsShipmentFixtures } from "@/features/statistics/data/statistics-fixtures";
import type { StatisticsClient } from "@/features/statistics/types/statistics-client";
import {
  filterStatisticsShipments,
  summarizeStatisticsShipments,
} from "@/features/statistics/utils/statistics-utils";
import { ShipmentDestinationsMap } from "@/features/statistics/components/ShipmentDestinationsMap";

type StatisticsDashboardProps = {
  selectedClient: StatisticsClient;
  onChangeClient: () => void;
  onRefresh: () => void;
};

export function StatisticsDashboard({
  selectedClient,
  onChangeClient,
  onRefresh,
}: StatisticsDashboardProps) {
  const [filters, setFilters] = useState<ShipmentFilters>(
    initialShipmentFilters,
  );

  const filteredShipments = useMemo(
    () =>
      filterStatisticsShipments(
        statisticsShipmentFixtures,
        selectedClient.value,
        filters,
      ),
    [filters, selectedClient.value],
  );

  const summary = useMemo(
    () => summarizeStatisticsShipments(filteredShipments),
    [filteredShipments],
  );

  function handleResetFilters() {
    setFilters(initialShipmentFilters);
  }

  return (
    <PageCard className="p-5 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            My Statistics
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <UserRound size={17} />

              <span>Selected client: {selectedClient.label}</span>
            </div>

            <button
              type="button"
              onClick={onChangeClient}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-ink/50 transition hover:text-primary focus:outline-none focus-visible:text-primary"
            >
              <UsersRound size={15} />
              Change client
            </button>
          </div>
        </div>

        <p className="text-sm text-ink/60 sm:self-end">
          Filter statistics by code, date, status, or proof of delivery.
        </p>
      </div>

      <StatisticsFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        onRefresh={onRefresh}
      />

      <StatisticsSummary summary={summary} />

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ShipmentStatusChart shipments={filteredShipments} />

        <PodStatusChart shipments={filteredShipments} />

        <ShipmentsTimelineChart shipments={filteredShipments} />

        <ShipmentDestinationsMap shipments={filteredShipments} />
      </div>
    </PageCard>
  );
}
