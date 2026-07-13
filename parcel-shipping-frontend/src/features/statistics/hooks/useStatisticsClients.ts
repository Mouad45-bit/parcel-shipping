"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  fetchStatisticsClients,
  StatisticsApiError,
} from "@/features/statistics/api/statistics-api";
import type { StatisticsClient } from "@/features/statistics/types/statistics-client";

type UseStatisticsClientsState = {
  clients: StatisticsClient[] | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useStatisticsClients():
  UseStatisticsClientsState {
  const router = useRouter();

  const [
    requestVersion,
    setRequestVersion,
  ] = useState(0);

  const [state, setState] = useState<{
    clients:
      StatisticsClient[] | null;
    isLoading: boolean;
    error: string | null;
  }>({
    clients: null,
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(() => {
    setRequestVersion(
      (currentVersion) =>
        currentVersion + 1,
    );
  }, []);

  useEffect(() => {
    const abortController =
      new AbortController();

    setState((currentState) => ({
      ...currentState,
      isLoading: true,
      error: null,
    }));

    fetchStatisticsClients(
      abortController.signal,
    )
      .then((clients) => {
        setState({
          clients,
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

        setState({
          clients: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load statistics clients.",
        });
      });

    return () => {
      abortController.abort();
    };
  }, [requestVersion, router]);

  return {
    ...state,
    refresh,
  };
}
