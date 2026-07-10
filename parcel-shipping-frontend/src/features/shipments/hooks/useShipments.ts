"use client";

import { useEffect, useState } from "react";
import {
  fetchShipments,
  type ShipmentPageResponse,
  type ShipmentQuery,
} from "@/features/shipments/api/shipments-api";

type UseShipmentsState = {
  data: ShipmentPageResponse | null;
  isLoading: boolean;
  error: string | null;
};

export function useShipments(query: ShipmentQuery): UseShipmentsState {
  const [state, setState] = useState<UseShipmentsState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const abortController = new AbortController();

    setState((currentState) => ({
      ...currentState,
      isLoading: true,
      error: null,
    }));

    fetchShipments(query, abortController.signal)
      .then((data) => {
        setState({
          data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load shipments.",
        });
      });

    return () => {
      abortController.abort();
    };
  }, [query]);

  return state;
}
