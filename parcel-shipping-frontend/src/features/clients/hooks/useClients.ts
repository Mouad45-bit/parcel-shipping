"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ClientApiError,
  fetchClients,
} from "@/features/clients/api/clients-api";
import type { Client } from "@/features/clients/types/client";

type UseClientsState = {
  clients: Client[] | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

type ClientsState = {
  clients: Client[] | null;
  isLoading: boolean;
  error: string | null;
};

export function useClients(): UseClientsState {
  const router = useRouter();

  const [
    requestVersion,
    setRequestVersion,
  ] = useState(0);

  const [state, setState] =
    useState<ClientsState>({
      clients: null,
      isLoading: true,
      error: null,
    });

  const refresh = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      isLoading: true,
      error: null,
    }));

    setRequestVersion(
      (currentVersion) =>
        currentVersion + 1,
    );
  }, []);

  useEffect(() => {
    const abortController =
      new AbortController();

    fetchClients(
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
            ClientApiError &&
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
              : "Unable to load clients.",
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