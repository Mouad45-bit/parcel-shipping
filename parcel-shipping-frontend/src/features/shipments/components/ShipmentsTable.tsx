"use client";

import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Printer,
} from "lucide-react";
import type {
  ShipmentSortKey,
  ShipmentSortState,
} from "@/features/shipments/api/shipments-api";
import { fetchShipmentPods } from "@/features/shipments/api/shipments-api";
import type {
  Shipment,
  ShipmentPod,
} from "@/features/shipments/types/shipment";
import { formatShipmentDateTime } from "@/features/shipments/utils/shipment-utils";
import { ShipmentStatusBadge } from "./ShipmentStatusBadge";

type ShipmentsTableProps = {
  shipments: Shipment[];
  selectedShipmentIds: Set<string>;
  onSelectedShipmentIdsChange: Dispatch<SetStateAction<Set<string>>>;
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortState: ShipmentSortState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortState: ShipmentSortState) => void;
  onViewPod: (shipment: Shipment, initialPosition?: number) => void;
};

type SortButtonProps = {
  label: string;
  column: ShipmentSortKey;
  sortState: ShipmentSortState;
  onSort: (column: ShipmentSortKey) => void;
};

type ShipmentPodThumbnailsProps = {
  shipment: Shipment;
  onViewPod: (shipment: Shipment, initialPosition?: number) => void;
};

const pageSizeOptions = [5, 10, 20];

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

function ShipmentPodThumbnails({
  shipment,
  onViewPod,
}: ShipmentPodThumbnailsProps) {
  const [pods, setPods] = useState<ShipmentPod[]>([]);
  const [isLoading, setIsLoading] = useState(shipment.podCount > 0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    fetchShipmentPods(shipment.id, abortController.signal)
      .then((response) => {
        setPods(response.items);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        console.error(
          "Unable to load shipment POD thumbnails.",
          error,
        );

        setPods([]);
        setHasError(true);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [shipment.id]);

  if (isLoading) {
    return (
      <div
        className="flex justify-center gap-1.5"
        aria-label={`Loading ${shipment.podCount} POD preview${shipment.podCount > 1 ? "s" : ""}`}
      >
        {Array.from({ length: Math.min(shipment.podCount, 3) }).map(
          (_, index) => (
            <span
              key={index}
              className="h-12 w-9 animate-pulse rounded-md border border-border bg-secondary/50"
            />
          ),
        )}
      </div>
    );
  }

  if (hasError || pods.length === 0) {
    return <span className="text-sm font-semibold text-ink/35">--</span>;
  }

  return (
    <div className="flex justify-center gap-1.5">
      {pods.map((pod) => (
        <button
          key={pod.id}
          type="button"
          onClick={() => onViewPod(shipment, pod.position)}
          aria-label={`View POD ${pod.position} for shipment ${shipment.trackingCode}`}
          className="group inline-flex cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Image
            src={pod.contentUrl}
            alt={`POD ${pod.position} preview for shipment ${shipment.trackingCode}`}
            width={36}
            height={48}
            unoptimized
            loading="lazy"
            className="h-12 w-9 rounded-md border border-border bg-surface object-cover shadow-sm transition group-hover:border-primary"
          />
        </button>
      ))}
    </div>
  );
}

export function ShipmentsTable({
  shipments,
  selectedShipmentIds,
  onSelectedShipmentIdsChange,
  isLoading,
  page,
  pageSize,
  totalItems,
  totalPages,
  sortState,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onViewPod,
}: ShipmentsTableProps) {
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  function handleSort(nextSortKey: ShipmentSortKey) {
    if (!sortState || sortState.key !== nextSortKey) {
      onSortChange({
        key: nextSortKey,
        direction: "asc",
      });

      return;
    }

    if (sortState.direction === "asc") {
      onSortChange({
        key: nextSortKey,
        direction: "desc",
      });

      return;
    }

    onSortChange(null);
  }

  function toggleShipmentSelection(shipmentId: string) {
    onSelectedShipmentIdsChange((currentSelectedIds) => {
      const nextSelectedIds = new Set(currentSelectedIds);

      if (nextSelectedIds.has(shipmentId)) {
        nextSelectedIds.delete(shipmentId);
      } else {
        nextSelectedIds.add(shipmentId);
      }

      return nextSelectedIds;
    });
  }

  const visibleShipmentIds = useMemo(
    () =>
      shipments
        .filter((shipment) => shipment.podCount > 0)
        .map((shipment) => shipment.id),
    [shipments],
  );

  const selectedCurrentShipmentCount = shipments.filter((shipment) =>
    selectedShipmentIds.has(shipment.id) && shipment.podCount > 0,
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
    onSelectedShipmentIdsChange((currentSelectedIds) => {
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

  const exportableShipments = shipments.filter(
    (shipment) => shipment.podCount > 0,
  );

  const exportedPodCount = exportableShipments.filter(
    (shipment) => shipment.exportedAt !== null,
  ).length;

  const pendingPodExportCount = exportableShipments.length - exportedPodCount;

  const safeTotalPages = Math.max(1, totalPages);
  const currentPageNumber = page + 1;

  const firstVisibleShipment = totalItems === 0 ? 0 : page * pageSize + 1;
  const lastVisibleShipment = Math.min((page + 1) * pageSize, totalItems);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-ink">
            {totalItems} {totalItems === 1 ? "Shipment" : "Shipments"}
          </p>

          <p className="mt-1 text-sm font-medium text-ink/55">
            Selected: {selectedCurrentShipmentCount}
          </p>
        </div>

        <p className="text-sm font-semibold text-ink/70 sm:self-end">
          Exported: {exportedPodCount} / Pending: {pendingPodExportCount}
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
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm font-semibold text-ink/60"
                >
                  Loading shipments...
                </td>
              </tr>
            ) : shipments.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-ink/60"
                >
                  No shipments match the selected filters.
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => {
                const isSelected = selectedShipmentIds.has(shipment.id);

                return (
                  <tr
                    key={shipment.id}
                    className="border-b border-border/70 transition hover:bg-secondary/15"
                  >
                    <td className="px-4 py-4 text-center">
                      {shipment.podCount > 0 ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleShipmentSelection(shipment.id)}
                          aria-label={`Select shipment ${shipment.trackingCode}`}
                          className="size-4 cursor-pointer rounded border-border [accent-color:var(--color-primary)]"
                        />
                      ) : null}
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
                      {shipment.podCount > 0 ? (
                        <ShipmentPodThumbnails
                          key={`${shipment.id}-${shipment.podCount}`}
                          shipment={shipment}
                          onViewPod={onViewPod}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-ink/35">
                          --
                        </span>
                      )}
                    </td>

                    <td
                      className={
                        shipment.exportedAt
                          ? "px-4 py-4 text-sm font-medium text-ink"
                          : "px-4 py-4 text-sm text-ink/65"
                      }
                    >
                      {formatShipmentDateTime(shipment.exportedAt)}
                    </td>

                    <td className="px-4 py-4">
                      {shipment.podCount > 0 ? (
                        <div className="flex justify-center gap-1.5">
                          <a
                            href={`/shipments/${shipment.id}/print`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Print shipment ${shipment.trackingCode}`}
                            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-primary transition hover:bg-secondary/50"
                          >
                            <Printer size={18} />
                          </a>
                        </div>
                      ) : null}
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
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
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
            Showing {firstVisibleShipment}-{lastVisibleShipment} of {totalItems}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(page - 1, 0))}
              disabled={page === 0 || isLoading}
              className="h-9 rounded-lg border border-border px-3 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>

            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-secondary">
              {currentPageNumber}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(Math.min(page + 1, safeTotalPages - 1))}
              disabled={currentPageNumber >= safeTotalPages || isLoading}
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
