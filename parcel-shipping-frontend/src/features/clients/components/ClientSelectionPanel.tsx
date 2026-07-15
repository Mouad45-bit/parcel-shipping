"use client";

import { Search, SearchCode, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { PageCard } from "@/components/ui/PageCard";
import type { Client } from "@/features/clients/types/client";

type ClientSelectionPanelProps = {
  clients: readonly Client[];
  onSelectClient:
    (client: Client) => void;
};

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function ClientSelectionPanel({
  clients,
  onSelectClient,
}: ClientSelectionPanelProps) {
  const [searchValue, setSearchValue] = useState("");

  const filteredClients = useMemo(() => {
    const normalizedSearchValue = normalizeSearchValue(searchValue);

    if (!normalizedSearchValue) {
      return clients;
    }

    return clients.filter((client) =>
      normalizeSearchValue(client.label).includes(normalizedSearchValue),
    );
  }, [clients, searchValue]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const firstClient = filteredClients[0];

    if (firstClient) {
      onSelectClient(firstClient);
    }
  }

  return (
    <PageCard className="overflow-hidden">
      <header className="border-b border-border px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-secondary/60 text-primary">
            <UsersRound size={24} />
          </span>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">
              Select a client
            </h1>

            <p className="mt-0.5 text-sm leading-5 text-ink/55">
              Choose a client to access the related back-office data.
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 sm:px-7">
        <form onSubmit={handleSubmit} role="search">
          <label
            htmlFor="client-search"
            className="text-sm font-semibold text-ink"
          >
            Search for a client
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
              />

              <input
                id="client-search"
                name="clientSearch"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                autoComplete="off"
                placeholder="Enter a client name"
                className="h-12 w-full rounded-lg border border-border bg-surface pl-11 pr-4 text-sm font-medium text-ink outline-none transition placeholder:text-ink/35 focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <Link
              href="/shipments/track"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg border border-primary bg-secondary px-5 text-sm font-bold text-primary transition hover:bg-secondary/75 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <SearchCode size={18} />
              Track a shipment
            </Link>
          </div>
        </form>

        <div className="mt-5 flex items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-ink">Client list</h2>

            <p className="mt-1 text-sm text-ink/50" aria-live="polite">
              {filteredClients.length}{" "}
              {filteredClients.length === 1 ? "client found" : "clients found"}
            </p>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-secondary/45 text-primary">
              <Search size={22} />
            </span>

            <p className="mt-4 text-sm font-bold text-ink">No client found</p>

            <p className="mt-1 max-w-md text-sm leading-6 text-ink/50">
              No client matches the entered search criteria.
            </p>
          </div>
        ) : (
          <ul className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {filteredClients.map((client) => (
              <li key={client.value}>
                <button
                  type="button"
                  onClick={() => onSelectClient(client)}
                  className="group flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left transition hover:border-primary/30 hover:bg-secondary/15 focus:outline-none focus:ring-2 focus:ring-primary/15"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/55 text-primary transition group-hover:bg-secondary">
                    <UserRound size={18} />
                  </span>

                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">
                    {client.label}
                  </span>

                  <span className="text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
                    Select client
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageCard>
  );
}
