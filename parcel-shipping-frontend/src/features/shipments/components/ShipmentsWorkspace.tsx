"use client";

import { useMemo, useState } from "react";
import { PageCard } from "@/components/ui/PageCard";
import { ClientSelectionGate } from "@/features/clients/components/ClientSelectionGate";
import type { Client } from "@/features/clients/types/client";
import type { ShipmentSortState } from "@/features/shipments/api/shipments-api";
import { useShipments } from "@/features/shipments/hooks/useShipments";
import {
  initialShipmentFilters,
  type ShipmentFilters,
} from "@/features/shipments/types/shipment-filters";
import { ShipmentsFilters } from "./ShipmentsFilters";
import { ShipmentsTable } from "./ShipmentsTable";
import { SelectedClientHeader } from "@/features/clients/components/SelectedClientHeader";

type ShipmentsWorkspaceProps = {
  selectedClientValue: string | null;
};

type SelectedClientShipmentsProps = {
  selectedClient: Client;
  onChangeClient: () => void;
};

export function ShipmentsWorkspace({
  selectedClientValue,
}: ShipmentsWorkspaceProps) {
  return (
    <ClientSelectionGate
      selectedClientValue={selectedClientValue}
      basePath="/shipments"
    >
      {({ selectedClient, onChangeClient }) => (
        <SelectedClientShipments
          key={selectedClient.value}
          selectedClient={selectedClient}
          onChangeClient={onChangeClient}
        />
      )}
    </ClientSelectionGate>
  );
}

function SelectedClientShipments({
  selectedClient,
  onChangeClient,
}: SelectedClientShipmentsProps) {
  const [filters, setFilters] = useState<ShipmentFilters>(
    initialShipmentFilters,
  );

  const [selectedShipmentIds, setSelectedShipmentIds] = useState<Set<string>>(
    () => new Set(),
  );

  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(10);

  const [sortState, setSortState] = useState<ShipmentSortState>(null);

  const shipmentQuery = useMemo(
    () => ({
      client: selectedClient.value,
      page,
      size: pageSize,
      sortState,
      ...filters,
    }),
    [filters, page, pageSize, selectedClient.value, sortState],
  );

  const { data, isLoading, error } = useShipments(shipmentQuery);

  function handleFiltersChange(nextFilters: ShipmentFilters) {
    setFilters(nextFilters);
    setPage(0);
  }

  function handleResetFilters() {
    setFilters(initialShipmentFilters);

    setPage(0);
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(0);
  }

  function handleSortChange(nextSortState: ShipmentSortState) {
    setSortState(nextSortState);
    setPage(0);
  }

  return (
    <PageCard className="p-5 sm:p-6 lg:p-7">
      <SelectedClientHeader
        title="My Shipments"
        description="Filter shipments by code, date, status, or proof of delivery."
        selectedClient={selectedClient}
        onChangeClient={onChangeClient}
      />

      <ShipmentsFilters
        filters={filters}
        selectedShipmentCount={selectedShipmentIds.size}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {error ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : (
        <ShipmentsTable
          shipments={data?.items ?? []}
          selectedShipmentIds={selectedShipmentIds}
          onSelectedShipmentIdsChange={setSelectedShipmentIds}
          isLoading={isLoading}
          page={data?.page ?? page}
          pageSize={data?.size ?? pageSize}
          totalItems={data?.totalItems ?? 0}
          totalPages={data?.totalPages ?? 1}
          sortState={sortState}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
        />
      )}
    </PageCard>
  );
}
