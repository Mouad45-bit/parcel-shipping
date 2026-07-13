import type { Metadata } from "next";
import { BackOfficeHeader } from "@/components/layout/BackOfficeHeader";
import { requireCurrentUser } from "@/features/auth/server/auth-session";
import { StatisticsWorkspace } from "@/features/statistics/components/StatisticsWorkspace";

export const metadata: Metadata = {
  title: "Statistics | Parcel Shipping",
  description:
    "Review shipment statistics for a selected client.",
};

type StatisticsPageProps = {
  searchParams: Promise<{
    client?: string | string[];
  }>;
};

export default async function StatisticsPage({
  searchParams,
}: StatisticsPageProps) {
  const currentUser =
    await requireCurrentUser();

  const resolvedSearchParams =
    await searchParams;

  const clientParameter =
    resolvedSearchParams.client;

  const selectedClientValue =
    Array.isArray(clientParameter)
      ? clientParameter[0] ?? null
      : clientParameter ?? null;

  return (
    <>
      <BackOfficeHeader
        activeSection="statistics"
        user={currentUser}
      />

      <main
        id="main-content"
        className="min-h-screen bg-page px-4 py-8 text-ink sm:px-6 lg:px-8"
      >
        <section className="mx-auto max-w-[1440px]">
          <StatisticsWorkspace
            selectedClientValue={
              selectedClientValue
            }
          />
        </section>
      </main>
    </>
  );
}
