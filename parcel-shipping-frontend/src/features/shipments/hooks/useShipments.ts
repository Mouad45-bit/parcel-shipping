"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  fetchShipments,
  ShipmentsApiError,
  type ShipmentPageResponse,
  type ShipmentQuery,
} from "@/features/shipments/api/shipments-api";

type SettledShipmentsState = {
  queryKey: string | null;
  data: ShipmentPageResponse | null;
  error: string | null;
};

type UseShipmentsState = {
  data: ShipmentPageResponse | null;
  isLoading: boolean;
  error: string | null;
};

export function useShipments(
  query: ShipmentQuery,
): UseShipmentsState {
  const router = useRouter();

  /*
   * Identifie précisément la requête actuellement demandée.
   * Toutes les propriétés de ShipmentQuery sont sérialisables.
   */
  const queryKey = useMemo(
    () => JSON.stringify(query),
    [query],
  );

  /*
   * Contient uniquement le résultat de la dernière requête terminée.
   * L'état de chargement sera dérivé de queryKey.
   */
  const [settledState, setSettledState] =
    useState<SettledShipmentsState>({
      queryKey: null,
      data: null,
      error: null,
    });

  useEffect(() => {
    const abortController =
      new AbortController();

    fetchShipments(
      query,
      abortController.signal,
    )
      .then((data) => {
        setSettledState({
          queryKey,
          data,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        if (
          error instanceof ShipmentsApiError &&
          error.status === 401
        ) {
          router.replace("/login");
          router.refresh();
          return;
        }

        setSettledState({
          queryKey,
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load shipments.",
        });
      });

    return () => {
      abortController.abort();
    };
  }, [query, queryKey, router]);

  /*
   * Tant que la requête terminée ne correspond pas à la requête
   * actuelle, le hook est considéré comme étant en chargement.
   */
  const isCurrentQuerySettled =
    settledState.queryKey === queryKey;

  return {
    data: isCurrentQuerySettled
      ? settledState.data
      : null,
    isLoading: !isCurrentQuerySettled,
    error: isCurrentQuerySettled
      ? settledState.error
      : null,
  };
}