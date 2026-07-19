import { fetchCsrfToken } from "@/features/auth/api/auth-api";
import {
  downloadBlob,
  extractFilename,
  readShipmentsApiError,
  ShipmentsApiError,
} from "@/features/shipments/api/shipments-api";
import type { ShipmentFilters } from "@/features/shipments/types/shipment-filters";
import type { ExportPageResponse } from "@/features/exports/types/export";

export type ExportSortKey =
  | "trackingCode"
  | "dispatchDate"
  | "status"
  | "statusDate"
  | "generatedAt"
  | "archivedAt";

export type ExportSortState = {
  key: ExportSortKey;
  direction: "asc" | "desc";
} | null;

export type ExportQuery = ShipmentFilters & {
  client: string;
  archived: boolean;
  exportDateFrom: string;
  exportDateTo: string;
  page: number;
  size: number;
  sortState: ExportSortState;
  refreshKey?: number;
};

function appendIfPresent(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined | null,
) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  searchParams.set(key, String(value));
}

export async function fetchExports(
  query: ExportQuery,
  signal?: AbortSignal,
): Promise<ExportPageResponse> {
  const searchParams = new URLSearchParams();

  appendIfPresent(searchParams, "client", query.client);
  appendIfPresent(searchParams, "archived", query.archived);
  appendIfPresent(searchParams, "page", query.page);
  appendIfPresent(searchParams, "size", query.size);
  appendIfPresent(searchParams, "trackingCode", query.trackingCode);
  appendIfPresent(searchParams, "dispatchDateFrom", query.dispatchDateFrom);
  appendIfPresent(searchParams, "dispatchDateTo", query.dispatchDateTo);
  appendIfPresent(searchParams, "status", query.status);
  appendIfPresent(searchParams, "proofOfDelivery", query.proofOfDelivery);
  appendIfPresent(searchParams, "exportDateFrom", query.exportDateFrom);
  appendIfPresent(searchParams, "exportDateTo", query.exportDateTo);

  if (query.sortState) {
    appendIfPresent(searchParams, "sortBy", query.sortState.key);
    appendIfPresent(searchParams, "sortDirection", query.sortState.direction);
  }

  const response = await fetch(`/api/exports?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const error = await readShipmentsApiError(response);

    throw new ShipmentsApiError(
      error?.message ?? "Unable to load exports.",
      response.status,
      error?.code,
    );
  }

  return response.json() as Promise<ExportPageResponse>;
}

export async function downloadExport(
  exportId: string,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `/api/exports/${encodeURIComponent(exportId)}/content`,
    {
      method: "GET",
      headers: {
        Accept: "application/pdf,application/json",
      },
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    const error = await readShipmentsApiError(response);

    throw new ShipmentsApiError(
      error?.message ?? "Unable to download the export.",
      response.status,
      error?.code,
    );
  }

  downloadBlob(
    await response.blob(),
    extractFilename(
      response.headers.get("content-disposition"),
      "pod-export.pdf",
    ),
  );
}

async function patchExport(
  exportId: string,
  action: "archive" | "unarchive",
  signal?: AbortSignal,
) {
  const csrfToken = await fetchCsrfToken(signal);

  const response = await fetch(
    `/api/exports/${encodeURIComponent(exportId)}/${action}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        [csrfToken.headerName]: csrfToken.token,
      },
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    const error = await readShipmentsApiError(response);

    throw new ShipmentsApiError(
      error?.message ?? `Unable to ${action} the export.`,
      response.status,
      error?.code,
    );
  }
}

export function archiveExport(
  exportId: string,
  signal?: AbortSignal,
) {
  return patchExport(exportId, "archive", signal);
}

export function unarchiveExport(
  exportId: string,
  signal?: AbortSignal,
) {
  return patchExport(exportId, "unarchive", signal);
}
