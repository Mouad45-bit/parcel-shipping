"use client";

import {
  LoaderCircle,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
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

type StatisticsDashboardProps = {
  selectedClient: Client;
  onChangeClient: () => void;
};

export function StatisticsDashboard({
  selectedClient,
  onChangeClient,
}: StatisticsDashboardProps) {
  const [filters, setFilters] =
    useState<ShipmentFilters>(
      initialShipmentFilters,
    );

  const query = useMemo(
    () => ({
      client:
        selectedClient.value,
      ...filters,
    }),
    [
      filters,
      selectedClient.value,
    ],
  );

  const {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useStatisticsDashboard(
    query,
  );

  function handleResetFilters() {
    setFilters(
      initialShipmentFilters,
    );
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

              <span>
                Selected client:{" "}
                {selectedClient.label}
              </span>
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
          Filter statistics by code,
          date, status, or proof of
          delivery.
        </p>
      </div>

      <StatisticsFilters
        filters={filters}
        isRefreshing={
          isRefreshing
        }
        onChange={setFilters}
        onReset={
          handleResetFilters
        }
        onRefresh={refresh}
      />

      {error ? (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>

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
          <LoaderCircle
            size={28}
            className="animate-spin text-primary"
          />

          <p className="mt-3 text-sm font-semibold text-ink/55">
            Calculating statistics...
          </p>
        </div>
      ) : null}

      {data ? (
        <>
          <StatisticsSummary
            summary={data.summary}
          />

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <ShipmentStatusChart
              items={
                data.shipmentStatuses
              }
            />

            <PodStatusChart
              items={data.podStatuses}
            />

            <ShipmentsTimelineChart
              periods={
                data.shipmentsByPeriod
              }
            />

            <ShipmentDestinationsMap
              items={
                data.destinations
              }
            />
          </div>
        </>
      ) : null}
    </PageCard>
  );
}