import type { Metadata } from "next";
import { BackOfficeHeader } from "@/components/layout/BackOfficeHeader";
import { requireCurrentUser } from "@/features/auth/server/auth-session";
import { ShipmentsWorkspace } from "@/features/shipments/components/ShipmentsWorkspace";
import { getSingleSearchParam } from "@/lib/navigation/search-params";

export const metadata: Metadata = {
  title: "Shipments | Parcel Shipping",
  description:
    "Review shipments for a selected client.",
};

type ShipmentsPageProps = {
  searchParams: Promise<{
    client?: string | string[];
  }>;
};

export default async function ShipmentsPage({
  searchParams,
}: ShipmentsPageProps) {
  const currentUser =
    await requireCurrentUser();

  const resolvedSearchParams =
    await searchParams;

  const selectedClientValue =
    getSingleSearchParam(
      resolvedSearchParams.client,
    );

  return (
    <>
      <BackOfficeHeader
        activeSection="shipments"
        user={currentUser}
      />

      <main
        id="main-content"
        className="min-h-screen bg-page px-4 py-8 text-ink sm:px-6 lg:px-8"
      >
        <section className="mx-auto max-w-[1440px]">
          <ShipmentsWorkspace
            selectedClientValue={
              selectedClientValue
            }
          />
        </section>
      </main>
    </>
  );
}