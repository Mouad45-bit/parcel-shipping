"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  fetchStatisticsDashboard,
  StatisticsApiError,
  type StatisticsDashboardQuery,
} from "@/features/statistics/api/statistics-api";
import type { StatisticsDashboardResponse } from "@/features/statistics/types/statistics";

type DashboardState = {
  queryKey: string | null;
  data:
    StatisticsDashboardResponse | null;
  isLoading: boolean;
  error: string | null;
};

type UseStatisticsDashboardState = {
  data:
    StatisticsDashboardResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
};

export function useStatisticsDashboard(
  query: StatisticsDashboardQuery,
): UseStatisticsDashboardState {
  const router = useRouter();

  const queryKey = useMemo(
    () => JSON.stringify(query),
    [query],
  );

  const [
    refreshVersion,
    setRefreshVersion,
  ] = useState(0);

  const [state, setState] =
    useState<DashboardState>({
      queryKey: null,
      data: null,
      isLoading: true,
      error: null,
    });

  const refresh = useCallback(() => {
    setRefreshVersion(
      (currentVersion) =>
        currentVersion + 1,
    );
  }, []);

  useEffect(() => {
    const abortController =
      new AbortController();

    setState((currentState) => ({
      queryKey,
      data:
        currentState.queryKey ===
        queryKey
          ? currentState.data
          : null,
      isLoading: true,
      error: null,
    }));

    fetchStatisticsDashboard(
      query,
      abortController.signal,
    )
      .then((data) => {
        setState({
          queryKey,
          data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (
          abortController.signal.aborted
        ) {
          return;
        }

        if (
          error instanceof
            StatisticsApiError &&
          error.status === 401
        ) {
          router.replace("/login");
          router.refresh();
          return;
        }

        setState((currentState) => {
          if (
            currentState.queryKey !==
            queryKey
          ) {
            return currentState;
          }

          return {
            ...currentState,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to load shipment statistics.",
          };
        });
      });

    return () => {
      abortController.abort();
    };
  }, [
    query,
    queryKey,
    refreshVersion,
    router,
  ]);

  const isCurrentQuery =
    state.queryKey === queryKey;

  const data = isCurrentQuery
    ? state.data
    : null;

  const isLoading =
    !isCurrentQuery ||
    state.isLoading;

  return {
    data,
    isLoading,
    isRefreshing:
      isLoading && data !== null,
    error: isCurrentQuery
      ? state.error
      : null,
    refresh,
  };
}
