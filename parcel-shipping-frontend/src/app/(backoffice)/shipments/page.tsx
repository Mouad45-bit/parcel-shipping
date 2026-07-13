import { BackOfficeHeader } from "@/components/layout/BackOfficeHeader";
import { requireCurrentUser } from "@/features/auth/server/auth-session";
import { ShipmentsWorkspace } from "@/features/shipments/components/ShipmentsWorkspace";

export default async function ShipmentsPage() {
  const currentUser =
    await requireCurrentUser();

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
          <ShipmentsWorkspace />
        </section>
      </main>
    </>
  );
}