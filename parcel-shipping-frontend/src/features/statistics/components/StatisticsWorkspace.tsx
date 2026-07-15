"use client";

import { ClientSelectionGate } from "@/features/clients/components/ClientSelectionGate";
import { StatisticsDashboard } from "@/features/statistics/components/StatisticsDashboard";

type StatisticsWorkspaceProps = {
  selectedClientValue:
    string | null;
};

export function StatisticsWorkspace({
  selectedClientValue,
}: StatisticsWorkspaceProps) {
  return (
    <ClientSelectionGate
      selectedClientValue={
        selectedClientValue
      }
      basePath="/statistics"
    >
      {({
        selectedClient,
        onChangeClient,
      }) => (
        <StatisticsDashboard
          selectedClient={
            selectedClient
          }
          onChangeClient={
            onChangeClient
          }
        />
      )}
    </ClientSelectionGate>
  );
}