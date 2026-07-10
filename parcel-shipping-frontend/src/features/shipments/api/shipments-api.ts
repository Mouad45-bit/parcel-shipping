import type { Shipment } from "@/features/shipments/types/shipment";
import type { ShipmentFilters } from "@/features/shipments/types/shipment-filters";

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
    const error = (await response.json()) as ApiErrorResponse;

    throw new Error(error.message || "Unable to load shipments.");
  }

  return response.json() as Promise<ShipmentPageResponse>;
}
