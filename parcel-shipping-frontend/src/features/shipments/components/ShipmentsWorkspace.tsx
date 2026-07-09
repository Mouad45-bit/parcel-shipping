"use client";

import { useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { PageCard } from "@/components/ui/PageCard";
import { shipmentFixtures } from "@/features/shipments/data/shipment-fixtures";
import {
  initialShipmentFilters,
  type ShipmentFilters,
} from "@/features/shipments/types/shipment-filters";
import { filterShipments } from "@/features/shipments/utils/shipment-utils";
import { ShipmentsFilters } from "./ShipmentsFilters";
import { ShipmentsTable } from "./ShipmentsTable";

export function ShipmentsWorkspace() {
  const [filters, setFilters] = useState<ShipmentFilters>(
    initialShipmentFilters,
  );

  const [selectedShipmentIds, setSelectedShipmentIds] = useState<Set<string>>(
    () => new Set(),
  );

  const filteredShipments = useMemo(
    () => filterShipments(shipmentFixtures, filters),
    [filters],
  );

  const selectedFilteredShipmentCount = filteredShipments.filter((shipment) =>
    selectedShipmentIds.has(shipment.id),
  ).length;

  return (
    <PageCard className="p-5 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            My Shipments
          </h1>

          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary">
            <UserRound size={17} />
            <span>Selected client: Aasim</span>
          </div>
        </div>

        <p className="text-sm text-ink/60 sm:self-end">
          Filter shipments by code, date, status, or proof of delivery.
        </p>
      </div>

      <ShipmentsFilters
        filters={filters}
        selectedShipmentCount={selectedFilteredShipmentCount}
        onChange={setFilters}
        onReset={() => setFilters(initialShipmentFilters)}
      />

      <ShipmentsTable
        shipments={filteredShipments}
        selectedShipmentIds={selectedShipmentIds}
        onSelectedShipmentIdsChange={setSelectedShipmentIds}
      />
    </PageCard>
  );
}
