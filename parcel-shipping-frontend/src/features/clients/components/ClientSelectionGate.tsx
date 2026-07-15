"use client";

import type { ReactNode } from "react";
import {
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageCard } from "@/components/ui/PageCard";
import { ClientSelectionPanel } from "@/features/clients/components/ClientSelectionPanel";
import { useClients } from "@/features/clients/hooks/useClients";
import type { Client } from "@/features/clients/types/client";

type ClientScopedPath =
  | "/statistics"
  | "/shipments"
  | "/exports";

type SelectedClientContext = {
  selectedClient: Client;
  onChangeClient: () => void;
};

type ClientSelectionGateProps = {
  selectedClientValue: string | null;
  basePath: ClientScopedPath;
  children: (
    context: SelectedClientContext,
  ) => ReactNode;
};

export function ClientSelectionGate({
  selectedClientValue,
  basePath,
  children,
}: ClientSelectionGateProps) {
  const router = useRouter();

  const {
    clients,
    isLoading,
    error,
    refresh,
  } = useClients();

  function handleSelectClient(
    client: Client,
  ) {
    const searchParams =
      new URLSearchParams({
        client: client.value,
      });

    router.push(
      `${basePath}?${searchParams.toString()}`,
    );
  }

  function handleChangeClient() {
    router.push(basePath);
  }

  if (
    isLoading &&
    clients === null
  ) {
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
            {error ??
              "An unexpected error occurred."}
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

  return children({
    selectedClient,
    onChangeClient:
      handleChangeClient,
  });
}
