import {
  readShipmentsApiError,
  ShipmentsApiError,
} from "@/features/shipments/api/shipments-api";
import type { ShipmentTracking } from "@/features/tracking/types/shipment-tracking";
import { normalizeTrackingCode } from "@/features/tracking/utils/shipment-tracking-utils";

export async function fetchShipmentTracking(
  trackingCode: string,
  signal?: AbortSignal,
): Promise<ShipmentTracking> {
  const normalizedTrackingCode =
    normalizeTrackingCode(
      trackingCode,
    );

  const response = await fetch(
    `/api/shipments/tracking/${encodeURIComponent(
      normalizedTrackingCode,
    )}`,
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
      await readShipmentsApiError(
        response,
      );

    throw new ShipmentsApiError(
      error?.message ??
        "Unable to track the shipment.",
      response.status,
      error?.code,
    );
  }

  return response.json() as
    Promise<ShipmentTracking>;
}
