"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  fetchShipmentTracking,
} from "@/features/tracking/api/shipment-tracking-api";
import { ShipmentsApiError } from "@/features/shipments/api/shipments-api";
import type {
  ShipmentTracking,
  ShipmentTrackingError,
} from "@/features/tracking/types/shipment-tracking";

type ShipmentTrackingState = {
  data: ShipmentTracking | null;
  requestedCode: string | null;
  isLoading: boolean;
  error: ShipmentTrackingError | null;
};

const initialState:
  ShipmentTrackingState = {
    data: null,
    requestedCode: null,
    isLoading: false,
    error: null,
  };

function resolveTrackingError(
  error: ShipmentsApiError,
): ShipmentTrackingError {
  if (
    error.status === 404 ||
    error.code ===
      "SHIPMENT_NOT_FOUND"
  ) {
    return {
      kind: "not-found",
      message:
        "No shipment matches this tracking code.",
    };
  }

  if (error.status === 400) {
    return {
      kind: "invalid",
      message: error.message,
    };
  }

  if (error.status === 403) {
    return {
      kind: "forbidden",
      message:
        "You are not allowed to access this shipment.",
    };
  }

  if (error.status === 503) {
    return {
      kind: "unavailable",
      message:
        "The shipments service is currently unavailable.",
    };
  }

  return {
    kind: "unexpected",
    message:
      error.message ||
      "Unable to track the shipment.",
  };
}

export function useShipmentTracking() {
  const router = useRouter();

  const abortControllerRef =
    useRef<AbortController | null>(
      null,
    );

  const [state, setState] =
    useState<ShipmentTrackingState>(
      initialState,
    );

  useEffect(() => {
    return () => {
      abortControllerRef.current
        ?.abort();
    };
  }, []);

  const track = useCallback(
    async (
      trackingCode: string,
    ) => {
      abortControllerRef.current
        ?.abort();

      const abortController =
        new AbortController();

      abortControllerRef.current =
        abortController;

      setState({
        data: null,
        requestedCode:
          trackingCode,
        isLoading: true,
        error: null,
      });

      try {
        const data =
          await fetchShipmentTracking(
            trackingCode,
            abortController.signal,
          );

        setState({
          data,
          requestedCode:
            trackingCode,
          isLoading: false,
          error: null,
        });
      } catch (error: unknown) {
        if (
          abortController.signal
            .aborted
        ) {
          return;
        }

        if (
          error instanceof
            ShipmentsApiError &&
          error.status === 401
        ) {
          router.replace("/login");
          router.refresh();
          return;
        }

        setState({
          data: null,
          requestedCode:
            trackingCode,
          isLoading: false,
          error:
            error instanceof
              ShipmentsApiError
              ? resolveTrackingError(
                  error,
                )
              : {
                  kind:
                    "unexpected",
                  message:
                    "Unable to track the shipment.",
                },
        });
      }
    },
    [router],
  );

  const reset = useCallback(() => {
    abortControllerRef.current
      ?.abort();

    setState(initialState);
  }, []);

  return {
    ...state,
    track,
    reset,
  };
}
