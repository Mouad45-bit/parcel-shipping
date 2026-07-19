import type { Shipment } from "@/features/shipments/types/shipment";
import type {
  PodDocument,
  ShipmentPodsResponse,
} from "@/features/shipments/types/shipment";
import type { ShipmentFilters } from "@/features/shipments/types/shipment-filters";
import { fetchCsrfToken } from "@/features/auth/api/auth-api";

export type ShipmentSortKey =
  | "trackingCode"
  | "dispatchDate"
  | "status"
  | "statusDate"
  | "proofOfDelivery"
  | "exportedAt";

export type ShipmentSortDirection = "asc" | "desc";

export type ShipmentSortState = {
  key: ShipmentSortKey;
  direction: ShipmentSortDirection;
} | null;

export type ShipmentPageResponse = {
  items: Shipment[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type ShipmentQuery = ShipmentFilters & {
  client: string;
  page: number;
  size: number;
  sortState: ShipmentSortState;
  refreshKey?: number;
};

export type ApiErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
  fieldErrors: Array<{
    field: string;
    message: string;
  }>;
};

export class ShipmentsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ShipmentsApiError";
  }
}

export async function readShipmentsApiError(
  response: Response,
): Promise<ApiErrorResponse | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as ApiErrorResponse;
  } catch {
    return null;
  }
}

function appendIfPresent(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | undefined | null,
) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  searchParams.set(key, String(value));
}

export async function fetchShipments(
  query: ShipmentQuery,
  signal?: AbortSignal,
): Promise<ShipmentPageResponse> {
  const searchParams = new URLSearchParams();

  appendIfPresent(searchParams, "client", query.client);
  appendIfPresent(searchParams, "page", query.page);
  appendIfPresent(searchParams, "size", query.size);

  appendIfPresent(searchParams, "trackingCode", query.trackingCode);
  appendIfPresent(searchParams, "dispatchDateFrom", query.dispatchDateFrom);
  appendIfPresent(searchParams, "dispatchDateTo", query.dispatchDateTo);
  appendIfPresent(searchParams, "status", query.status);
  appendIfPresent(searchParams, "proofOfDelivery", query.proofOfDelivery);
  appendIfPresent(searchParams, "statusDateFrom", query.statusDateFrom);
  appendIfPresent(searchParams, "statusDateTo", query.statusDateTo);

  if (query.sortState) {
    appendIfPresent(searchParams, "sortBy", query.sortState.key);
    appendIfPresent(searchParams, "sortDirection", query.sortState.direction);
  }

  const response = await fetch(`/api/shipments?${searchParams.toString()}`, {
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
      error?.message ?? "Unable to load shipments.",
      response.status,
      error?.code,
    );
  }

  return response.json() as Promise<ShipmentPageResponse>;
}

export async function fetchShipmentPods(
  shipmentId: string,
  signal?: AbortSignal,
): Promise<ShipmentPodsResponse> {
  const response = await fetch(
    `/api/shipments/${encodeURIComponent(shipmentId)}/pods`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    const error = await readShipmentsApiError(response);

    throw new ShipmentsApiError(
      error?.message ?? "Unable to load POD documents.",
      response.status,
      error?.code,
    );
  }

  return response.json() as Promise<ShipmentPodsResponse>;
}

export async function fetchPodDocument(
  shipmentId: string,
  signal?: AbortSignal,
): Promise<PodDocument> {
  const response = await fetch(
    `/api/shipments/${encodeURIComponent(shipmentId)}/pod-document`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    const error = await readShipmentsApiError(response);

    throw new ShipmentsApiError(
      error?.message ?? "Unable to load the POD document.",
      response.status,
      error?.code,
    );
  }

  return response.json() as Promise<PodDocument>;
}

export function extractFilename(
  contentDisposition: string | null,
  fallback: string,
) {
  if (!contentDisposition) {
    return fallback;
  }

  const match = /filename="?([^";]+)"?/i.exec(contentDisposition);

  if (!match) {
    return fallback;
  }

  const filename = match[1].trim();

  return /^[A-Za-z0-9._-]+$/.test(filename) ? filename : fallback;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportShipmentPod(
  shipmentId: string,
  signal?: AbortSignal,
): Promise<void> {
  const csrfToken = await fetchCsrfToken(signal);

  const response = await fetch(
    `/api/shipments/${encodeURIComponent(shipmentId)}/pod-export`,
    {
      method: "POST",
      headers: {
        Accept: "application/pdf,application/json",
        [csrfToken.headerName]: csrfToken.token,
      },
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    const error = await readShipmentsApiError(response);

    throw new ShipmentsApiError(
      error?.message ?? "Unable to export the POD PDF.",
      response.status,
      error?.code,
    );
  }

  const blob = await response.blob();
  const filename = extractFilename(
    response.headers.get("content-disposition"),
    "pod-export.pdf",
  );

  downloadBlob(blob, filename);
}

export async function exportSelectedShipmentPods(
  shipmentIds: string[],
  signal?: AbortSignal,
): Promise<void> {
  const csrfToken = await fetchCsrfToken(signal);

  const response = await fetch("/api/shipments/pod-export", {
    method: "POST",
    headers: {
      Accept: "application/zip,application/json",
      "Content-Type": "application/json",
      [csrfToken.headerName]: csrfToken.token,
    },
    body: JSON.stringify({ shipmentIds }),
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const error = await readShipmentsApiError(response);

    throw new ShipmentsApiError(
      error?.message ?? "Unable to export the selected POD files.",
      response.status,
      error?.code,
    );
  }

  const blob = await response.blob();
  const filename = extractFilename(
    response.headers.get("content-disposition"),
    "pod-exports.zip",
  );

  downloadBlob(blob, filename);
}
