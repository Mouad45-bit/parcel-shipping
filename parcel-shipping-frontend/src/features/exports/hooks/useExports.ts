"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchExports,
  type ExportQuery,
} from "@/features/exports/api/exports-api";
import type { ExportPageResponse } from "@/features/exports/types/export";
import { ShipmentsApiError } from "@/features/shipments/api/shipments-api";

type UseExportsState = {
  data: ExportPageResponse | null;
  isLoading: boolean;
  error: string | null;
};

export function useExports(
  query: ExportQuery,
): UseExportsState {
  const router = useRouter();
  const queryKey = useMemo(() => JSON.stringify(query), [query]);
  const [state, setState] = useState<{
    queryKey: string | null;
    data: ExportPageResponse | null;
    error: string | null;
  }>({
    queryKey: null,
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchExports(query, controller.signal)
      .then((data) =>
        setState({
          queryKey,
          data,
          error: null,
        }),
      )
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof ShipmentsApiError && error.status === 401) {
          router.replace("/login");
          return;
        }

        setState({
          queryKey,
          data: null,
          error:
            error instanceof Error ? error.message : "Unable to load exports.",
        });
      });

    return () => controller.abort();
  }, [query, queryKey, router]);

  const isCurrent = state.queryKey === queryKey;

  return {
    data: isCurrent ? state.data : null,
    isLoading: !isCurrent,
    error: isCurrent ? state.error : null,
  };
}
