"use client";

import { useRouter } from "next/navigation";
import { ClientSelectionPanel } from "@/features/statistics/components/ClientSelectionPanel";
import { StatisticsDashboard } from "@/features/statistics/components/StatisticsDashboard";
import { statisticsClientFixtures } from "@/features/statistics/data/statistics-client-fixtures";
import type { StatisticsClient } from "@/features/statistics/types/statistics-client";

type StatisticsWorkspaceProps = {
  selectedClientValue: string | null;
};

export function StatisticsWorkspace({
  selectedClientValue,
}: StatisticsWorkspaceProps) {
  const router = useRouter();

  const selectedClient =
    selectedClientValue
      ? statisticsClientFixtures.find(
          (client) =>
            client.value ===
            selectedClientValue,
        ) ?? null
      : null;

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

  function handleRefreshStatistics() {
    /*
     * Comportement temporaire avant la connexion
     * au statistics-service.
     *
     * Le futur hook useStatistics remplacera cet
     * appel par une nouvelle requête HTTP.
     */
    router.refresh();
  }

  if (!selectedClient) {
    return (
      <div>
        {selectedClientValue ? (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
          >
            The requested client could not be
            found. Select an available client
            from the list.
          </div>
        ) : null}

        <ClientSelectionPanel
          clients={statisticsClientFixtures}
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
      onRefresh={
        handleRefreshStatistics
      }
    />
  );
}