"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageCard } from "@/components/ui/PageCard";
import { ClientSelectionGate } from "@/features/clients/components/ClientSelectionGate";
import { SelectedClientHeader } from "@/features/clients/components/SelectedClientHeader";
import type { Client } from "@/features/clients/types/client";
import {
  archiveExport,
  downloadExport,
  unarchiveExport,
  type ExportSortState,
} from "@/features/exports/api/exports-api";
import { useExports } from "@/features/exports/hooks/useExports";
import type { ShipmentExport } from "@/features/exports/types/export";
import { ShipmentFilterFields } from "@/features/shipments/components/ShipmentFilterFields";
import { ShipmentStatusBadge } from "@/features/shipments/components/ShipmentStatusBadge";
import {
  initialShipmentFilters,
  type ShipmentFilters,
} from "@/features/shipments/types/shipment-filters";
import { formatShipmentDateTime } from "@/features/shipments/utils/shipment-utils";
import { ShipmentsApiError } from "@/features/shipments/api/shipments-api";

type ExportsWorkspaceProps = {
  selectedClientValue: string | null;
  archived: boolean;
};

type SelectedClientExportsProps = {
  selectedClient: Client;
  archived: boolean;
  onChangeClient: () => void;
};

const pageSizeOptions = [5, 10, 20];

export function ExportsWorkspace({
  selectedClientValue,
  archived,
}: ExportsWorkspaceProps) {
  return (
    <ClientSelectionGate selectedClientValue={selectedClientValue} basePath="/exports">
      {({ selectedClient, onChangeClient }) => (
        <SelectedClientExports
          key={`${selectedClient.value}-${archived}`}
          selectedClient={selectedClient}
          archived={archived}
          onChangeClient={onChangeClient}
        />
      )}
    </ClientSelectionGate>
  );
}

function SelectedClientExports({
  selectedClient,
  archived,
  onChangeClient,
}: SelectedClientExportsProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ShipmentFilters>(initialShipmentFilters);
  const [exportDateFrom, setExportDateFrom] = useState("");
  const [exportDateTo, setExportDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortState, setSortState] = useState<ExportSortState>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutatingExportId, setMutatingExportId] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      client: selectedClient.value,
      archived,
      exportDateFrom,
      exportDateTo,
      page,
      size: pageSize,
      sortState,
      refreshKey,
      ...filters,
    }),
    [
      archived,
      exportDateFrom,
      exportDateTo,
      filters,
      page,
      pageSize,
      refreshKey,
      selectedClient.value,
      sortState,
    ],
  );

  const { data, isLoading, error } = useExports(query);

  function resetFilters() {
    setFilters(initialShipmentFilters);
    setExportDateFrom("");
    setExportDateTo("");
    setPage(0);
  }

  async function runMutation(
    item: ShipmentExport,
    action: "download" | "archive" | "unarchive",
  ) {
    setMutationError(null);
    setMutatingExportId(item.id);

    try {
      if (action === "download") {
        await downloadExport(item.id);
      } else if (action === "archive") {
        await archiveExport(item.id);
        setRefreshKey((key) => key + 1);
      } else {
        await unarchiveExport(item.id);
        setRefreshKey((key) => key + 1);
      }
    } catch (mutationFailure) {
      if (
        mutationFailure instanceof ShipmentsApiError &&
        mutationFailure.status === 401
      ) {
        router.replace("/login");
        return;
      }

      setMutationError(
        mutationFailure instanceof Error
          ? mutationFailure.message
          : "Unable to update the export.",
      );
    } finally {
      setMutatingExportId(null);
    }
  }

  const safeTotalPages = Math.max(1, data?.totalPages ?? 1);

  return (
    <PageCard className="p-5 sm:p-6 lg:p-7">
      <SelectedClientHeader
        title="Exports"
        description="Download active POD exports or manage archived exports."
        selectedClient={selectedClient}
        onChangeClient={onChangeClient}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/exports?client=${encodeURIComponent(selectedClient.value)}&archived=${(!archived).toString()}`}
          className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-primary"
        >
          {archived ? "See active exports" : "See archive"}
        </Link>

        <button
          type="button"
          onClick={resetFilters}
          className="cursor-pointer text-sm font-bold text-primary"
        >
          Reset filters
        </button>
      </div>

      <ShipmentFilterFields
        idPrefix="exports"
        filters={filters}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setPage(0);
        }}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-ink/70">
          Export date from
          <input
            type="date"
            value={exportDateFrom}
            onChange={(event) => {
              setExportDateFrom(event.target.value);
              setPage(0);
            }}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>

        <label className="text-sm font-semibold text-ink/70">
          Export date to
          <input
            type="date"
            value={exportDateTo}
            onChange={(event) => {
              setExportDateTo(event.target.value);
              setPage(0);
            }}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </div>

      {error || mutationError ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error ?? mutationError}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-[1180px] w-full border-collapse text-left">
          <thead className="border-b border-border bg-secondary/20 text-sm">
            <tr>
              {[
                ["trackingCode", "Shipment code"],
                ["dispatchDate", "Dispatch date"],
                ["status", "Status"],
                ["statusDate", "Status date"],
                ["generatedAt", "Export date"],
              ].map(([key, label]) => (
                <th key={key} className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!sortState || sortState.key !== key) {
                        setSortState({ key: key as NonNullable<ExportSortState>["key"], direction: "asc" });
                      } else if (sortState.direction === "asc") {
                        setSortState({ key: sortState.key, direction: "desc" });
                      } else {
                        setSortState(null);
                      }
                      setPage(0);
                    }}
                    className="cursor-pointer font-bold text-ink"
                  >
                    {label}
                  </button>
                </th>
              ))}
              <th className="px-4 py-4">POD</th>
              <th className="px-4 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink/60">
                  Loading exports...
                </td>
              </tr>
            ) : (data?.items ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink/60">
                  No exports match the selected filters.
                </td>
              </tr>
            ) : (
              data?.items.map((item) => (
                <tr key={item.id} className="border-b border-border/70">
                  <td className="px-4 py-4 text-sm font-bold text-primary">
                    {item.trackingCode}
                  </td>
                  <td className="px-4 py-4 text-sm">{formatShipmentDateTime(item.dispatchDate)}</td>
                  <td className="px-4 py-4">
                    <ShipmentStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-4 text-sm">{formatShipmentDateTime(item.statusDate)}</td>
                  <td className="px-4 py-4 text-sm">{formatShipmentDateTime(item.generatedAt)}</td>
                  <td className="px-4 py-4 text-sm">{item.podCount} document{item.podCount === 1 ? "" : "s"}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        disabled={mutatingExportId === item.id}
                        onClick={() => void runMutation(item, "download")}
                        className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-bold text-primary disabled:opacity-50"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        disabled={mutatingExportId === item.id}
                        onClick={() =>
                          void runMutation(item, archived ? "unarchive" : "archive")
                        }
                        className="cursor-pointer rounded-lg bg-primary px-3 py-2 text-sm font-bold text-secondary disabled:opacity-50"
                      >
                        {archived ? "Unarchive" : "Archive"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm font-medium text-ink/70">
          Rows per page
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(0);
            }}
            className="h-10 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-ink outline-none"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 0 || isLoading}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            className="h-9 cursor-pointer rounded-lg border border-border px-3 text-sm font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-secondary">
            {page + 1}
          </span>
          <button
            type="button"
            disabled={page + 1 >= safeTotalPages || isLoading}
            onClick={() => setPage((current) => Math.min(current + 1, safeTotalPages - 1))}
            className="h-9 cursor-pointer rounded-lg border border-border px-3 text-sm font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </PageCard>
  );
}
