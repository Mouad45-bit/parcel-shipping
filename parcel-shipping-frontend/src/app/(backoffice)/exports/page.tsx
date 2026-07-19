import type { Metadata } from "next";
import { BackOfficeHeader } from "@/components/layout/BackOfficeHeader";
import { requireCurrentUser } from "@/features/auth/server/auth-session";
import { ExportsWorkspace } from "@/features/exports/components/ExportsWorkspace";
import { getSingleSearchParam } from "@/lib/navigation/search-params";

export const metadata: Metadata = {
  title: "Exports | Parcel Shipping",
  description: "Manage proof of delivery exports.",
};

type ExportsPageProps = {
  searchParams: Promise<{
    client?: string | string[];
    archived?: string | string[];
  }>;
};

export default async function ExportsPage({
  searchParams,
}: ExportsPageProps) {
  const currentUser = await requireCurrentUser();
  const resolvedSearchParams = await searchParams;
  const selectedClientValue = getSingleSearchParam(resolvedSearchParams.client);
  const archived =
    getSingleSearchParam(resolvedSearchParams.archived) === "true";

  return (
    <>
      <BackOfficeHeader activeSection="exports" user={currentUser} />

      <main className="min-h-screen bg-page px-4 py-8 text-ink sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[1440px]">
          <ExportsWorkspace
            selectedClientValue={selectedClientValue}
            archived={archived}
          />
        </section>
      </main>
    </>
  );
}
