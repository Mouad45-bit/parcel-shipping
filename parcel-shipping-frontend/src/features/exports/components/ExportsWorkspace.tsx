"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  Download,
  PackageCheck,
  RotateCcw,
  Undo2,
} from "lucide-react";
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
import {
  DateRangeFields,
  ShipmentFilterFields,
} from "@/features/shipments/components/ShipmentFilterFields";
import { ShipmentPodThumbnails } from "@/features/shipments/components/ShipmentPodThumbnails";
import { ShipmentStatusBadge } from "@/features/shipments/components/ShipmentStatusBadge";
import { PodViewerModal } from "@/features/shipments/components/PodViewerModal";
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

type ViewerExportState = {
  exportItem: ShipmentExport;
  initialPosition: number | null;
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
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<ShipmentFilters>(initialShipmentFilters);
  const [exportDateFrom, setExportDateFrom] = useState("");
  const [exportDateTo, setExportDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortState, setSortState] = useState<ExportSortState>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutatingExportId, setMutatingExportId] = useState<string | null>(null);
  const [selectedExportIds, setSelectedExportIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isUpdatingSelectedExports, setIsUpdatingSelectedExports] =
    useState(false);
  const [viewerExport, setViewerExport] = useState<ViewerExportState | null>(
    null,
  );
  const [archiveSwitchIndicatorIndex, setArchiveSwitchIndicatorIndex] =
    useState(archived ? 1 : 0);

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
  const oppositeSummaryQuery = useMemo(
    () => ({
      client: selectedClient.value,
      archived: !archived,
      exportDateFrom,
      exportDateTo,
      page: 0,
      size: 1,
      sortState: null,
      refreshKey,
      ...filters,
    }),
    [
      archived,
      exportDateFrom,
      exportDateTo,
      filters,
      refreshKey,
      selectedClient.value,
    ],
  );
  const { data: oppositeSummaryData } = useExports(oppositeSummaryQuery);

  const visibleExportIds = useMemo(
    () =>
      (data?.items ?? []).map((item) => item.id),
    [data?.items],
  );

  const areAllVisibleExportsSelected =
    visibleExportIds.length > 0 &&
    visibleExportIds.every((exportId) =>
      selectedExportIds.has(exportId),
    );

  const areSomeVisibleExportsSelected =
    visibleExportIds.some((exportId) =>
      selectedExportIds.has(exportId),
    ) && !areAllVisibleExportsSelected;

  const hasActiveFilters =
    (
      Object.keys(
        initialShipmentFilters,
      ) as Array<keyof ShipmentFilters>
    ).some(
      (key) =>
        filters[key] !==
        initialShipmentFilters[key],
    ) ||
    exportDateFrom !== "" ||
    exportDateTo !== "";

  useEffect(() => {
    const visibleExportIdSet = new Set(visibleExportIds);

    queueMicrotask(() => {
      setSelectedExportIds((currentIds) => {
        const nextIds = new Set<string>();

        for (const exportId of currentIds) {
          if (visibleExportIdSet.has(exportId)) {
            nextIds.add(exportId);
          }
        }

        return nextIds.size === currentIds.size ? currentIds : nextIds;
      });
    });
  }, [visibleExportIds]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        areSomeVisibleExportsSelected;
    }
  }, [areSomeVisibleExportsSelected]);

  function resetFilters() {
    setFilters(initialShipmentFilters);
    setExportDateFrom("");
    setExportDateTo("");
    setPage(0);
  }

  function toggleExportSelection(exportId: string) {
    setSelectedExportIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(exportId)) {
        nextIds.delete(exportId);
      } else {
        nextIds.add(exportId);
      }

      return nextIds;
    });
  }

  function toggleVisibleExportsSelection() {
    setSelectedExportIds((currentIds) => {
      const nextIds = new Set(currentIds);
      const shouldDeselectVisibleExports =
        areAllVisibleExportsSelected || areSomeVisibleExportsSelected;

      visibleExportIds.forEach((exportId) => {
        if (shouldDeselectVisibleExports) {
          nextIds.delete(exportId);
        } else {
          nextIds.add(exportId);
        }
      });

      return nextIds;
    });
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

  async function updateSelectedExportsArchiveState() {
    if (
      selectedExportIds.size === 0 ||
      isUpdatingSelectedExports
    ) {
      return;
    }

    setMutationError(null);
    setIsUpdatingSelectedExports(true);

    try {
      for (const exportId of selectedExportIds) {
        if (archived) {
          await unarchiveExport(exportId);
        } else {
          await archiveExport(exportId);
        }
      }

      setSelectedExportIds(new Set());
      setRefreshKey((key) => key + 1);
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
          : `Unable to ${archived ? "unarchive" : "archive"} the selected exports.`,
      );
    } finally {
      setIsUpdatingSelectedExports(false);
    }
  }

  function handleViewExportPod(
    exportItem: ShipmentExport,
    initialPosition?: number,
  ) {
    setViewerExport({
      exportItem,
      initialPosition: initialPosition ?? null,
    });
  }

  const safeTotalPages = Math.max(1, data?.totalPages ?? 1);
  const totalExports = data?.totalItems ?? 0;
  const activeExportCount = archived
    ? oppositeSummaryData?.totalItems
    : totalExports;
  const archivedExportCount = archived
    ? totalExports
    : oppositeSummaryData?.totalItems;

  return (
    <PageCard className="p-5 sm:p-6 lg:p-7">
      <SelectedClientHeader
        title="Exports"
        description="Download POD exports and manage their archive state."
        selectedClient={selectedClient}
        onChangeClient={onChangeClient}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className="relative flex min-w-max items-center rounded-2xl border border-secondary bg-secondary/30 p-1.5 shadow-sm"
          aria-label="Switch exports view"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-1.5 rounded-xl bg-primary shadow-md transition-transform duration-200 ease-out"
            style={{
              left: "calc(0.375rem + 4px)",
              transform: `translateX(calc(${archiveSwitchIndicatorIndex} * 4rem))`,
              width: "calc(4rem - 8px)",
            }}
          />

          <Link
            href={`/exports?client=${encodeURIComponent(selectedClient.value)}&archived=false`}
            aria-current={!archived ? "page" : undefined}
            aria-label="Active exports"
            onClick={() => {
              setArchiveSwitchIndicatorIndex(0);
            }}
            className={[
              "group relative z-10 inline-flex h-9 w-16 items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ease-out",
              archiveSwitchIndicatorIndex === 0
                ? "text-secondary"
                : "text-primary hover:-translate-y-[0.5px]",
            ].join(" ")}
          >
            {archiveSwitchIndicatorIndex !== 0 ? (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-1 right-1 rounded-xl bg-[#e8b98f] opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100"
              />
            ) : null}

            <PackageCheck
              size={19}
              aria-hidden="true"
              className="relative z-10"
            />
          </Link>

          <Link
            href={`/exports?client=${encodeURIComponent(selectedClient.value)}&archived=true`}
            aria-current={archived ? "page" : undefined}
            aria-label="Archived exports"
            onClick={() => {
              setArchiveSwitchIndicatorIndex(1);
            }}
            className={[
              "group relative z-10 inline-flex h-9 w-16 items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ease-out",
              archiveSwitchIndicatorIndex === 1
                ? "text-secondary"
                : "text-primary hover:-translate-y-[0.5px]",
            ].join(" ")}
          >
            {archiveSwitchIndicatorIndex !== 1 ? (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-1 right-1 rounded-xl bg-[#e8b98f] opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100"
              />
            ) : null}

            <Archive
              size={19}
              aria-hidden="true"
              className="relative z-10"
            />
          </Link>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={updateSelectedExportsArchiveState}
            disabled={
              selectedExportIds.size === 0 ||
              isUpdatingSelectedExports
            }
            className="inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary bg-secondary px-4 text-sm font-semibold text-primary transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {archived ? (
              <Undo2 size={17} />
            ) : (
              <Archive size={17} />
            )}
            {isUpdatingSelectedExports
              ? archived
                ? "Restoring..."
                : "Archiving..."
              : archived
                ? "Restore"
                : "Archive"}
          </button>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-secondary transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            <RotateCcw size={17} />
            Reset filters
          </button>
        </div>
      </div>

      <ShipmentFilterFields
        idPrefix="exports"
        filters={filters}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setPage(0);
        }}
        className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(170px,0.9fr)_minmax(220px,1fr)_minmax(190px,0.85fr)_minmax(220px,1fr)_minmax(220px,1fr)]"
      >
        <DateRangeFields
          title="Export date"
          fromId="exports-export-date-from"
          toId="exports-export-date-to"
          fromValue={exportDateFrom}
          toValue={exportDateTo}
          onFromChange={(value) => {
            setExportDateFrom(value);
            setPage(0);
          }}
          onToChange={(value) => {
            setExportDateTo(value);
            setPage(0);
          }}
        />
      </ShipmentFilterFields>

      {error || mutationError ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error ?? mutationError}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-ink">
            {totalExports} {totalExports === 1 ? "Export" : "Exports"}
          </p>

          <p className="mt-1 text-sm font-medium text-ink/55">
            Selected: {selectedExportIds.size}
          </p>
        </div>

        <p className="text-sm font-semibold text-ink/70 sm:self-end">
          Active: {activeExportCount ?? "--"} / Archived:{" "}
          {archivedExportCount ?? "--"}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-[1180px] w-full border-collapse text-left">
          <thead className="border-b border-border bg-secondary/20 text-sm">
            <tr>
              <th className="w-12 px-4 py-4 text-center">
                <input
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  checked={areAllVisibleExportsSelected}
                  onChange={toggleVisibleExportsSelection}
                  aria-label="Select all visible exports"
                  className="size-4 cursor-pointer rounded border-border [accent-color:var(--color-primary)]"
                />
              </th>

              {[
                ["trackingCode", "Shipment code", false],
                ["dispatchDate", "Dispatch date", false],
                ["status", "Status", true],
                ["statusDate", "Status date", false],
                ["generatedAt", "Export date", false],
              ].map(([key, label, isCentered]) => (
                <th
                  key={key.toString()}
                  className={
                    isCentered
                      ? "px-4 py-4 text-center"
                      : "px-4 py-4"
                  }
                >
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
              <th className="px-4 py-4 text-center">POD</th>
              <th className="px-4 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink/60">
                  Loading exports...
                </td>
              </tr>
            ) : (data?.items ?? []).length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink/60">
                  No exports match the selected filters.
                </td>
              </tr>
            ) : (
              data?.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/70 transition hover:bg-secondary/15"
                >
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedExportIds.has(item.id)}
                      onChange={() => toggleExportSelection(item.id)}
                      aria-label={`Select export for shipment ${item.trackingCode}`}
                      className="size-4 cursor-pointer rounded border-border [accent-color:var(--color-primary)]"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-primary">
                    {item.trackingCode}
                  </td>
                  <td className="px-4 py-4 text-sm">{formatShipmentDateTime(item.dispatchDate)}</td>
                  <td className="px-4 py-4 text-center">
                    <ShipmentStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-4 text-sm">{formatShipmentDateTime(item.statusDate)}</td>
                  <td className="px-4 py-4 text-sm">{formatShipmentDateTime(item.generatedAt)}</td>
                  <td className="px-4 py-4 text-center">
                    {item.podCount > 0 ? (
                      <ShipmentPodThumbnails
                        key={`${item.shipmentId}-${item.podCount}`}
                        shipmentId={item.shipmentId}
                        trackingCode={item.trackingCode}
                        podCount={item.podCount}
                        onViewPod={(initialPosition) =>
                          handleViewExportPod(item, initialPosition)
                        }
                      />
                    ) : (
                      <span className="text-sm font-semibold text-ink/35">
                        --
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        disabled={mutatingExportId === item.id}
                        onClick={() => void runMutation(item, "download")}
                        aria-label={`Download export for shipment ${item.trackingCode}`}
                        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-primary transition hover:bg-secondary/50 disabled:opacity-50"
                      >
                        <Download size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={mutatingExportId === item.id}
                        onClick={() =>
                          void runMutation(item, archived ? "unarchive" : "archive")
                        }
                        aria-label={`${archived ? "Restore" : "Archive"} export for shipment ${item.trackingCode}`}
                        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-primary transition hover:bg-secondary/50 disabled:opacity-50"
                      >
                        {archived ? (
                          <Undo2 size={18} aria-hidden="true" />
                        ) : (
                          <Archive size={18} aria-hidden="true" />
                        )}
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

      <PodViewerModal
        isOpen={viewerExport !== null}
        shipmentId={viewerExport?.exportItem.shipmentId ?? null}
        trackingCode={viewerExport?.exportItem.trackingCode ?? null}
        initialPosition={viewerExport?.initialPosition ?? null}
        onClose={() => setViewerExport(null)}
      />
    </PageCard>
  );
}
