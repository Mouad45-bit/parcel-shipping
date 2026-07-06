import { BackOfficeHeader } from "@/components/layout/BackOfficeHeader";
import { ShipmentsWorkspace } from "@/features/shipments/components/ShipmentsWorkspace";

export default function ShipmentsPage() {
  return (
    <>
      <BackOfficeHeader activeSection="shipments" />

      <main
        id="main-content"
        className="min-h-screen bg-page px-4 py-8 text-ink sm:px-6 lg:px-8"
      >
        <section className="mx-auto max-w-[1440px]">
          <ShipmentsWorkspace />
        </section>
      </main>
    </>
  );
}