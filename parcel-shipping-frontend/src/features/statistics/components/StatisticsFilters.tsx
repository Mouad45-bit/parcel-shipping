"use client";

import {
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { ShipmentFilterFields } from "@/features/shipments/components/ShipmentFilterFields";
import {
  initialShipmentFilters,
  type ShipmentFilters,
} from "@/features/shipments/types/shipment-filters";

type StatisticsFiltersProps = {
  filters: ShipmentFilters;
  onChange: (filters: ShipmentFilters) => void;
  onReset: () => void;
  onRefresh: () => void;
};

export function StatisticsFilters({
  filters,
  onChange,
  onReset,
  onRefresh,
}: StatisticsFiltersProps) {
  const hasActiveFilters = (
    Object.keys(
      initialShipmentFilters,
    ) as Array<keyof ShipmentFilters>
  ).some(
    (key) =>
      filters[key] !==
      initialShipmentFilters[key],
  );

  return (
    <form
      onSubmit={(event) =>
        event.preventDefault()
      }
      className="mt-6"
    >
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary bg-secondary px-4 text-sm font-semibold text-primary transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-secondary transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <RotateCcw size={17} />
          Reset filters
        </button>
      </div>

      <ShipmentFilterFields
        idPrefix="statistics"
        filters={filters}
        onChange={onChange}
      />
    </form>
  );
}
