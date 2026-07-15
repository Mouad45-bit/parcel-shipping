"use client";

import {
  UserRound,
  UsersRound,
} from "lucide-react";
import type { Client } from "@/features/clients/types/client";

type SelectedClientHeaderProps = {
  title: string;
  description: string;
  selectedClient: Client;
  onChangeClient: () => void;
};

export function SelectedClientHeader({
  title,
  description,
  selectedClient,
  onChangeClient,
}: SelectedClientHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {title}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <UserRound
              size={17}
              aria-hidden="true"
            />

            <span>
              Selected client:{" "}
              {selectedClient.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onChangeClient}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-ink/50 transition hover:text-primary focus:outline-none focus-visible:text-primary"
          >
            <UsersRound
              size={15}
              aria-hidden="true"
            />

            Change client
          </button>
        </div>
      </div>

      <p className="text-sm text-ink/60 sm:max-w-md sm:self-end sm:text-right">
        {description}
      </p>
    </header>
  );
}
