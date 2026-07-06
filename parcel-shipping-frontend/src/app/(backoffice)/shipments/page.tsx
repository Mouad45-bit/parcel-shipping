import { BackOfficeHeader } from "@/components/layout/BackOfficeHeader";

export default function ShipmentsPage() {
  return (
    <>
      <BackOfficeHeader activeSection="shipments" />

      <main
        id="main-content"
        className="min-h-screen bg-page px-4 py-8 text-ink sm:px-6 lg:px-8"
      >
        <section className="mx-auto max-w-[1440px]">
          <p className="text-sm font-semibold text-primary">Shipments</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            My Shipments
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
            Manage, filter, track, and review all parcel shipments from one
            workspace.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <p className="text-sm font-semibold text-primary">
              Shipment workspace
            </p>

            <h2 className="mt-2 text-xl font-bold">
              The shipment list is being prepared
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-ink/70">
              Filters, shipment status badges, the shipment table, pagination,
              and printing actions will be added progressively.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}