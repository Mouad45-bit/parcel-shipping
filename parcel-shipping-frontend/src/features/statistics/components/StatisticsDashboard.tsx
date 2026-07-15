"use client";

import { LoaderCircle, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { PageCard } from "@/components/ui/PageCard";
import {
  initialShipmentFilters,
  type ShipmentFilters,
} from "@/features/shipments/types/shipment-filters";
import { PodStatusChart } from "@/features/statistics/components/PodStatusChart";
import { ShipmentDestinationsMap } from "@/features/statistics/components/ShipmentDestinationsMap";
import { ShipmentStatusChart } from "@/features/statistics/components/ShipmentStatusChart";
import { ShipmentsTimelineChart } from "@/features/statistics/components/ShipmentsTimelineChart";
import { StatisticsFilters } from "@/features/statistics/components/StatisticsFilters";
import { StatisticsSummary } from "@/features/statistics/components/StatisticsSummary";
import { useStatisticsDashboard } from "@/features/statistics/hooks/useStatisticsDashboard";
import type { Client } from "@/features/clients/types/client";
import { SelectedClientHeader } from "@/features/clients/components/SelectedClientHeader";

type StatisticsDashboardProps = {
  selectedClient: Client;
  onChangeClient: () => void;
};

export function StatisticsDashboard({
  selectedClient,
  onChangeClient,
}: StatisticsDashboardProps) {
  const [filters, setFilters] = useState<ShipmentFilters>(
    initialShipmentFilters,
  );

  const query = useMemo(
    () => ({
      client: selectedClient.value,
      ...filters,
    }),
    [filters, selectedClient.value],
  );

  const { data, isLoading, isRefreshing, error, refresh } =
    useStatisticsDashboard(query);

  function handleResetFilters() {
    setFilters(initialShipmentFilters);
  }

  return (
    <PageCard className="p-5 sm:p-6 lg:p-7">
      <SelectedClientHeader
        title="My Statistics"
        description="Filter statistics by code, date, status, or proof of delivery."
        selectedClient={selectedClient}
        onChangeClient={onChangeClient}
      />

      <StatisticsFilters
        filters={filters}
        isRefreshing={isRefreshing}
        onChange={setFilters}
        onReset={handleResetFilters}
        onRefresh={refresh}
      />

      {error ? (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-semibold text-red-700">{error}</p>

          <button
            type="button"
            onClick={refresh}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-bold text-red-700"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      ) : null}

      {isLoading && data === null ? (
        <div
          role="status"
          className="flex min-h-64 flex-col items-center justify-center"
        >
          <LoaderCircle size={28} className="animate-spin text-primary" />

          <p className="mt-3 text-sm font-semibold text-ink/55">
            Calculating statistics...
          </p>
        </div>
      ) : null}

      {data ? (
        <>
          <StatisticsSummary summary={data.summary} />

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <ShipmentStatusChart items={data.shipmentStatuses} />

            <PodStatusChart items={data.podStatuses} />

            <ShipmentsTimelineChart periods={data.shipmentsByPeriod} />

            <ShipmentDestinationsMap items={data.destinations} />
          </div>
        </>
      ) : null}
    </PageCard>
  );
}
