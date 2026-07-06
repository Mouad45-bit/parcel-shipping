export default function ShipmentsPage() {
  return (
    <main className="min-h-screen bg-page px-6 py-10 text-ink">
      <section className="mx-auto max-w-7xl">
        <p className="text-sm font-medium text-primary">Parcel Shipping</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          My Shipments
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
          Manage, track, and review all parcel shipments from one place.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-medium text-primary">
            Shipments module
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Back-office interface is being prepared
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-ink/70">
            The shared header, navigation, filters, shipment table, and
            shipment details view will be added progressively in this module.
          </p>
        </div>
      </section>
    </main>
  );
}