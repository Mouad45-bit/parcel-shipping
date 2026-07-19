"use client";

import { useEffect, useMemo, useState } from "react";
import { PageCard } from "@/components/ui/PageCard";
import { ClientSelectionGate } from "@/features/clients/components/ClientSelectionGate";
import type { Client } from "@/features/clients/types/client";
import {
  exportSelectedShipmentPods,
  exportShipmentPod,
  ShipmentsApiError,
  type ShipmentSortState,
} from "@/features/shipments/api/shipments-api";
import { useShipments } from "@/features/shipments/hooks/useShipments";
import {
  initialShipmentFilters,
  type ShipmentFilters,
} from "@/features/shipments/types/shipment-filters";
import { ShipmentsFilters } from "./ShipmentsFilters";
import { ShipmentsTable } from "./ShipmentsTable";
import { SelectedClientHeader } from "@/features/clients/components/SelectedClientHeader";
import { PodViewerModal } from "./PodViewerModal";
import type { Shipment } from "@/features/shipments/types/shipment";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [filters, setFilters] = useState<ShipmentFilters>(
    initialShipmentFilters,
  );

  const [selectedShipmentIds, setSelectedShipmentIds] = useState<Set<string>>(
    () => new Set(),
  );

  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(10);

  const [sortState, setSortState] = useState<ShipmentSortState>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewerShipment, setViewerShipment] = useState<Shipment | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const shipmentQuery = useMemo(
    () => ({
      client: selectedClient.value,
      page,
      size: pageSize,
      sortState,
      refreshKey,
      ...filters,
    }),
    [filters, page, pageSize, refreshKey, selectedClient.value, sortState],
  );

  const { data, isLoading, error } = useShipments(shipmentQuery);

  useEffect(() => {
    const eligibleIds = new Set(
      (data?.items ?? [])
        .filter((shipment) => shipment.podCount > 0)
        .map((shipment) => shipment.id),
    );

    queueMicrotask(() => {
      setSelectedShipmentIds((currentIds) => {
        const nextIds = new Set<string>();

        for (const shipmentId of currentIds) {
          if (eligibleIds.has(shipmentId)) {
            nextIds.add(shipmentId);
          }
        }

        return nextIds.size === currentIds.size ? currentIds : nextIds;
      });
    });
  }, [data?.items]);

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

  async function handleExportShipment(shipment: Shipment) {
    setMutationError(null);

    try {
      await exportShipmentPod(shipment.id);
      setRefreshKey((key) => key + 1);
    } catch (exportError) {
      if (exportError instanceof ShipmentsApiError && exportError.status === 401) {
        router.replace("/login");
        return;
      }

      setMutationError(
        exportError instanceof Error
          ? exportError.message
          : "Unable to export the POD PDF.",
      );
    }
  }

  async function handleExportSelectedShipments() {
    if (selectedShipmentIds.size === 0) {
      return;
    }

    setMutationError(null);

    try {
      await exportSelectedShipmentPods(Array.from(selectedShipmentIds));
      setRefreshKey((key) => key + 1);
    } catch (exportError) {
      if (exportError instanceof ShipmentsApiError && exportError.status === 401) {
        router.replace("/login");
        return;
      }

      setMutationError(
        exportError instanceof Error
          ? exportError.message
          : "Unable to export the selected POD files.",
      );
    }
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

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          disabled={selectedShipmentIds.size === 0}
          onClick={handleExportSelectedShipments}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-secondary transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Export selected POD
        </button>
      </div>

      {mutationError ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {mutationError}
        </div>
      ) : null}

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
          onViewPod={setViewerShipment}
          onExportPod={handleExportShipment}
        />
      )}

      <PodViewerModal
        isOpen={viewerShipment !== null}
        shipmentId={viewerShipment?.id ?? null}
        trackingCode={viewerShipment?.trackingCode ?? null}
        onClose={() => setViewerShipment(null)}
      />
    </PageCard>
  );
}
