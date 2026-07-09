"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  FileWarning,
  Printer,
} from "lucide-react";
import type { Shipment } from "@/features/shipments/types/shipment";
import { formatShipmentDateTime } from "@/features/shipments/utils/shipment-utils";
import { ShipmentStatusBadge } from "./ShipmentStatusBadge";

type SortKey =
  | "trackingCode"
  | "dispatchDate"
  | "status"
  | "statusDate"
  | "proofOfDelivery"
  | "exportedAt";

type SortDirection = "asc" | "desc";

type SortState = {
  key: SortKey;
  direction: SortDirection;
} | null;

type ShipmentsTableProps = {
  shipments: Shipment[];
};

type SortButtonProps = {
  label: string;
  column: SortKey;
  sortState: SortState;
  onSort: (column: SortKey) => void;
};

const pageSizeOptions = [5, 10, 20];

function getSortValue(shipment: Shipment, key: SortKey): string {
  const value = shipment[key];

  return value ?? "";
}

function SortButton({ label, column, sortState, onSort }: SortButtonProps) {
  const isActive = sortState?.key === column;

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="inline-flex cursor-pointer items-center gap-1 font-bold text-ink transition hover:text-primary"
    >
      {label}

      {isActive ? (
        sortState.direction === "asc" ? (
          <ArrowUp size={15} />
        ) : (
          <ArrowDown size={15} />
        )
      ) : (
        <ArrowUpDown size={15} className="text-ink/35" />
      )}
    </button>
  );
}

function ProofOfDeliveryState({
  value,
}: {
  value: Shipment["proofOfDelivery"];
}) {
  const isAvailable = value === "available";

  return (
    <span
      className={
        isAvailable
          ? "inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"
          : "inline-flex items-center gap-1.5 text-sm font-medium text-ink/55"
      }
    >
      {isAvailable ? <CheckCircle2 size={16} /> : <FileWarning size={16} />}
      {isAvailable ? "Available" : "Missing"}
    </span>
  );
}

export function ShipmentsTable({ shipments }: ShipmentsTableProps) {
  const [sortState, setSortState] = useState<SortState>(null);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  function handleSort(nextSortKey: SortKey) {
    setSortState((currentState) => {
      if (!currentState || currentState.key !== nextSortKey) {
        return {
          key: nextSortKey,
          direction: "asc",
        };
      }

      if (currentState.direction === "asc") {
        return {
          key: nextSortKey,
          direction: "desc",
        };
      }

      return null;
    });

    setCurrentPage(1);
  }

  function toggleShipmentSelection(shipmentId: string) {
    setSelectedShipmentIds((currentSelectedIds) => {
      const nextSelectedIds = new Set(currentSelectedIds);

      if (nextSelectedIds.has(shipmentId)) {
        nextSelectedIds.delete(shipmentId);
      } else {
        nextSelectedIds.add(shipmentId);
      }

      return nextSelectedIds;
    });
  }

  const sortedShipments = useMemo(() => {
    if (!sortState) {
      return shipments;
    }

    return [...shipments].sort((firstShipment, secondShipment) => {
      const firstValue = getSortValue(firstShipment, sortState.key);
      const secondValue = getSortValue(secondShipment, sortState.key);

      const comparison = firstValue.localeCompare(secondValue, undefined, {
        numeric: true,
        sensitivity: "base",
      });

      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [shipments, sortState]);

  const totalPages = Math.max(1, Math.ceil(sortedShipments.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * pageSize;
  const pageEndIndex = pageStartIndex + pageSize;
  const visibleShipments = sortedShipments.slice(pageStartIndex, pageEndIndex);

  const visibleShipmentIds = useMemo(
    () => visibleShipments.map((shipment) => shipment.id),
    [visibleShipments],
  );

  const selectedCurrentShipmentCount = shipments.filter((shipment) =>
    selectedShipmentIds.has(shipment.id),
  ).length;

  const areAllVisibleShipmentsSelected =
    visibleShipmentIds.length > 0 &&
    visibleShipmentIds.every((shipmentId) =>
      selectedShipmentIds.has(shipmentId),
    );

  const areSomeVisibleShipmentsSelected =
    visibleShipmentIds.some((shipmentId) =>
      selectedShipmentIds.has(shipmentId),
    ) && !areAllVisibleShipmentsSelected;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        areSomeVisibleShipmentsSelected;
    }
  }, [areSomeVisibleShipmentsSelected]);

  function toggleVisibleShipmentsSelection() {
    setSelectedShipmentIds((currentSelectedIds) => {
      const nextSelectedIds = new Set(currentSelectedIds);

      const shouldDeselectVisibleShipments =
        areAllVisibleShipmentsSelected || areSomeVisibleShipmentsSelected;

      visibleShipmentIds.forEach((shipmentId) => {
        if (shouldDeselectVisibleShipments) {
          nextSelectedIds.delete(shipmentId);
        } else {
          nextSelectedIds.add(shipmentId);
        }
      });

      return nextSelectedIds;
    });
  }

  const exportedPodCount = shipments.filter(
    (shipment) => shipment.exportedAt !== null,
  ).length;

  const pendingPodExportCount = shipments.length - exportedPodCount;

  const firstVisibleShipment =
    sortedShipments.length === 0 ? 0 : pageStartIndex + 1;

  const lastVisibleShipment = Math.min(pageEndIndex, sortedShipments.length);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-ink">
            {shipments.length}{" "}
            {shipments.length === 1 ? "Shipment" : "Shipments"}
          </p>

          <p className="mt-1 text-sm font-medium text-ink/55">
            Selected: {selectedCurrentShipmentCount}
          </p>
        </div>

        <p className="text-sm font-semibold text-ink/70 sm:self-end">
          POD exported: {exportedPodCount} / Pending export:{" "}
          {pendingPodExportCount}
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[1160px] w-full border-collapse text-left">
          <thead className="border-b border-border bg-secondary/20">
            <tr className="text-sm">
              <th className="w-12 px-4 py-4 text-center">
                <input
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  checked={areAllVisibleShipmentsSelected}
                  onChange={toggleVisibleShipmentsSelection}
                  aria-label="Select all visible shipments"
                  className="size-4 cursor-pointer rounded border-border [accent-color:var(--color-primary)]"
                />
              </th>

              <th className="px-4 py-4">
                <SortButton
                  label="Shipment code"
                  column="trackingCode"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>

              <th className="px-4 py-4">
                <SortButton
                  label="Dispatch date"
                  column="dispatchDate"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>

              <th className="px-4 py-4 text-center">
                <SortButton
                  label="Status"
                  column="status"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>

              <th className="px-4 py-4">
                <SortButton
                  label="Status date"
                  column="statusDate"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>

              <th className="px-4 py-4 text-center">
                <SortButton
                  label="POD"
                  column="proofOfDelivery"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>

              <th className="px-4 py-4">
                <SortButton
                  label="Export date"
                  column="exportedAt"
                  sortState={sortState}
                  onSort={handleSort}
                />
              </th>

              <th className="px-4 py-4 text-center font-bold text-ink">
                Print
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleShipments.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-ink/60"
                >
                  No shipments match the selected filters.
                </td>
              </tr>
            ) : (
              visibleShipments.map((shipment) => {
                const isSelected = selectedShipmentIds.has(shipment.id);

                return (
                  <tr
                    key={shipment.id}
                    className="border-b border-border/70 transition hover:bg-secondary/15"
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleShipmentSelection(shipment.id)}
                        aria-label={`Select shipment ${shipment.trackingCode}`}
                        className="size-4 cursor-pointer rounded border-border [accent-color:var(--color-primary)]"
                      />
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-primary">
                      {shipment.trackingCode}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-ink">
                      {formatShipmentDateTime(shipment.dispatchDate)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <ShipmentStatusBadge status={shipment.status} />
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-ink">
                      {formatShipmentDateTime(shipment.statusDate)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <ProofOfDeliveryState value={shipment.proofOfDelivery} />
                    </td>

                    <td className="px-4 py-4 text-sm text-ink/65">
                      {formatShipmentDateTime(shipment.exportedAt)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        disabled
                        aria-label={`Print shipment ${shipment.trackingCode}`}
                        className="inline-flex size-9 cursor-not-allowed items-center justify-center rounded-lg text-primary/45"
                      >
                        <Printer size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
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
              setCurrentPage(1);
            }}
            className="h-10 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-4">
          <p className="text-sm text-ink/60">
            Showing {firstVisibleShipment}-{lastVisibleShipment} of{" "}
            {sortedShipments.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(safeCurrentPage - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="h-9 rounded-lg border border-border px-3 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>

            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-secondary">
              {safeCurrentPage}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage(Math.min(safeCurrentPage + 1, totalPages))
              }
              disabled={safeCurrentPage === totalPages}
              className="h-9 rounded-lg border border-border px-3 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
