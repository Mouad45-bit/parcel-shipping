"use client";

import {
  BarChart3,
  MapPinned,
  PieChart,
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
import { StatisticsFilters } from "@/features/statistics/components/StatisticsFilters";
import { StatisticsSummary } from "@/features/statistics/components/StatisticsSummary";
import { statisticsShipmentFixtures } from "@/features/statistics/data/statistics-fixtures";
import type { StatisticsClient } from "@/features/statistics/types/statistics-client";
import {
  filterStatisticsShipments,
  summarizeStatisticsShipments,
} from "@/features/statistics/utils/statistics-utils";

type StatisticsDashboardProps = {
  selectedClient: StatisticsClient;
  onChangeClient: () => void;
  onRefresh: () => void;
};

type VisualizationPlaceholderProps = {
  icon: typeof PieChart;
  title: string;
  description: string;
};

function VisualizationPlaceholder({
  icon: Icon,
  title,
  description,
}: VisualizationPlaceholderProps) {
  return (
    <section className="flex min-h-72 flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
      <header className="flex items-center gap-3 border-b border-border pb-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/55 text-primary">
          <Icon size={20} />
        </span>

        <div>
          <h2 className="text-base font-bold text-ink">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-ink/50">
            {description}
          </p>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center py-8">
        <p className="text-sm font-medium text-ink/45">
          Visualization will appear here.
        </p>
      </div>
    </section>
  );
}

export function StatisticsDashboard({
  selectedClient,
  onChangeClient,
  onRefresh,
}: StatisticsDashboardProps) {
  const [filters, setFilters] =
    useState<ShipmentFilters>(
      initialShipmentFilters,
    );

  const filteredShipments = useMemo(
    () =>
      filterStatisticsShipments(
        statisticsShipmentFixtures,
        selectedClient.value,
        filters,
      ),
    [
      filters,
      selectedClient.value,
    ],
  );

  const summary = useMemo(
    () =>
      summarizeStatisticsShipments(
        filteredShipments,
      ),
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
          Filter statistics by code, date, status, or proof of delivery.
        </p>
      </div>

      <StatisticsFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        onRefresh={onRefresh}
      />

      <StatisticsSummary
        summary={summary}
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <VisualizationPlaceholder
          icon={PieChart}
          title="Shipment statuses"
          description="Distribution of shipments by status."
        />

        <VisualizationPlaceholder
          icon={PieChart}
          title="Proof of delivery statuses"
          description="Distribution of available and missing POD."
        />

        <VisualizationPlaceholder
          icon={BarChart3}
          title="Shipments by period"
          description="Evolution of shipment volume over time."
        />

        <VisualizationPlaceholder
          icon={MapPinned}
          title="Shipment destinations"
          description="Geographical distribution of destinations."
        />
      </div>
    </PageCard>
  );
}
