import type { Metadata } from "next";
import { BackOfficeHeader } from "@/components/layout/BackOfficeHeader";
import { requireCurrentUser } from "@/features/auth/server/auth-session";
import { ShipmentTrackingWorkspace } from "@/features/tracking/components/ShipmentTrackingWorkspace";
import { getSingleSearchParam } from "@/lib/navigation/search-params";

export const metadata: Metadata = {
  title:
    "Track a Shipment | Parcel Shipping",
  description:
    "Track a parcel shipment by its tracking code.",
};

type ShipmentTrackingPageProps = {
  searchParams: Promise<{
    code?: string | string[];
  }>;
};

export default async function ShipmentTrackingPage({
  searchParams,
}: ShipmentTrackingPageProps) {
  const currentUser =
    await requireCurrentUser();

  const resolvedSearchParams =
    await searchParams;

  const initialTrackingCode =
    getSingleSearchParam(
      resolvedSearchParams.code,
    );

  return (
    <>
      <BackOfficeHeader
        activeSection="tracking"
        user={currentUser}
      />

      <main
        id="main-content"
        className="min-h-screen bg-page px-4 py-8 text-ink sm:px-6 lg:px-8"
      >
        <section className="mx-auto max-w-[1100px]">
          <ShipmentTrackingWorkspace
            initialTrackingCode={
              initialTrackingCode
            }
          />
        </section>
      </main>
    </>
  );
}
