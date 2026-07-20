"use client";

import {
  FileDown,
  RotateCcw,
} from "lucide-react";
import { ShipmentFilterFields } from "@/features/shipments/components/ShipmentFilterFields";
import {
  initialShipmentFilters,
  type ShipmentFilters,
} from "@/features/shipments/types/shipment-filters";

type ShipmentsFiltersProps = {
  filters: ShipmentFilters;
  selectedShipmentCount: number;
  isExporting: boolean;
  onChange: (filters: ShipmentFilters) => void;
  onReset: () => void;
  onExport: () => void;
};

export function ShipmentsFilters({
  filters,
  selectedShipmentCount,
  isExporting,
  onChange,
  onReset,
  onExport,
}: ShipmentsFiltersProps) {
  const hasActiveFilters = (
    Object.keys(
      initialShipmentFilters,
    ) as Array<keyof ShipmentFilters>
  ).some(
    (key) =>
      filters[key] !==
      initialShipmentFilters[key],
  );

  const canExport =
    selectedShipmentCount > 0;

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
          onClick={onExport}
          disabled={!canExport || isExporting}
          className="inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary bg-secondary px-4 text-sm font-semibold text-primary transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <FileDown size={17} />
          {isExporting ? "Exporting..." : "Export"}
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
        idPrefix="shipments"
        filters={filters}
        onChange={onChange}
      />
    </form>
  );
}
