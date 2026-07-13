"use client";

import {
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageCard } from "@/components/ui/PageCard";
import { ClientSelectionPanel } from "@/features/statistics/components/ClientSelectionPanel";
import { StatisticsDashboard } from "@/features/statistics/components/StatisticsDashboard";
import { useStatisticsClients } from "@/features/statistics/hooks/useStatisticsClients";
import type { StatisticsClient } from "@/features/statistics/types/statistics-client";

type StatisticsWorkspaceProps = {
  selectedClientValue:
    string | null;
};

export function StatisticsWorkspace({
  selectedClientValue,
}: StatisticsWorkspaceProps) {
  const router = useRouter();

  const {
    clients,
    isLoading,
    error,
    refresh,
  } = useStatisticsClients();

  function handleSelectClient(
    client: StatisticsClient,
  ) {
    const searchParams =
      new URLSearchParams({
        client: client.value,
      });

    router.push(
      `/statistics?${searchParams.toString()}`,
    );
  }

  function handleChangeClient() {
    router.push("/statistics");
  }

  if (isLoading && clients === null) {
    return (
      <PageCard className="flex min-h-64 items-center justify-center p-6">
        <div
          role="status"
          className="text-center"
        >
          <LoaderCircle
            size={28}
            className="mx-auto animate-spin text-primary"
          />

          <p className="mt-3 text-sm font-semibold text-ink/60">
            Loading clients...
          </p>
        </div>
      </PageCard>
    );
  }

  if (clients === null) {
    return (
      <PageCard className="p-6">
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-4"
        >
          <p className="text-sm font-bold text-red-800">
            Unable to load clients
          </p>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-secondary"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </PageCard>
    );
  }

  const selectedClient =
    selectedClientValue
      ? clients.find(
          (client) =>
            client.value ===
            selectedClientValue,
        ) ?? null
      : null;

  if (!selectedClient) {
    return (
      <div>
        {selectedClientValue ? (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
          >
            The requested client could not
            be found. Select an available
            client from the list.
          </div>
        ) : null}

        <ClientSelectionPanel
          clients={clients}
          onSelectClient={
            handleSelectClient
          }
        />
      </div>
    );
  }

  return (
    <StatisticsDashboard
      selectedClient={selectedClient}
      onChangeClient={
        handleChangeClient
      }
    />
  );
}