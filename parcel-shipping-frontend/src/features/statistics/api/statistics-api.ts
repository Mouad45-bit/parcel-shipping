import type { ShipmentFilters } from "@/features/shipments/types/shipment-filters";
import type { StatisticsDashboardResponse } from "@/features/statistics/types/statistics";

export type StatisticsDashboardQuery =
  ShipmentFilters & {
    client: string;
  };

type StatisticsApiErrorResponse = {
  timestamp?: string;
  status?: number;
  error?: string;
  code?: string;
  message?: string;
  path?: string;
};

export class StatisticsApiError
  extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "StatisticsApiError";
  }
}

async function readApiError(
  response: Response,
): Promise<StatisticsApiErrorResponse | null> {
  const contentType =
    response.headers.get("content-type") ?? "";

  if (
    !contentType.includes(
      "application/json",
    )
  ) {
    return null;
  }

  try {
    return await response.json() as
      StatisticsApiErrorResponse;
  } catch {
    return null;
  }
}

function appendIfPresent(
  searchParams: URLSearchParams,
  key: string,
  value: string | null | undefined,
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return;
  }

  searchParams.set(key, value);
}

export async function fetchStatisticsDashboard(
  query: StatisticsDashboardQuery,
  signal?: AbortSignal,
): Promise<StatisticsDashboardResponse> {
  const searchParams =
    new URLSearchParams();

  appendIfPresent(
    searchParams,
    "client",
    query.client,
  );

  appendIfPresent(
    searchParams,
    "trackingCode",
    query.trackingCode,
  );

  appendIfPresent(
    searchParams,
    "dispatchDateFrom",
    query.dispatchDateFrom,
  );

  appendIfPresent(
    searchParams,
    "dispatchDateTo",
    query.dispatchDateTo,
  );

  if (query.status !== "all") {
    appendIfPresent(
      searchParams,
      "status",
      query.status,
    );
  }

  if (
    query.proofOfDelivery !== "all"
  ) {
    appendIfPresent(
      searchParams,
      "proofOfDelivery",
      query.proofOfDelivery,
    );
  }

  appendIfPresent(
    searchParams,
    "statusDateFrom",
    query.statusDateFrom,
  );

  appendIfPresent(
    searchParams,
    "statusDateTo",
    query.statusDateTo,
  );

  const response = await fetch(
    `/api/statistics/dashboard?${searchParams.toString()}`,
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
    const error =
      await readApiError(response);

    throw new StatisticsApiError(
      error?.message ??
        "Unable to load shipment statistics.",
      response.status,
      error?.code,
    );
  }

  return response.json() as
    Promise<StatisticsDashboardResponse>;
}
