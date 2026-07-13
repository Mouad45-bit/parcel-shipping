import type { Metadata } from "next";
import { BackOfficeHeader } from "@/components/layout/BackOfficeHeader";
import { ProfileWorkspace } from "@/features/auth/components/ProfileWorkspace";
import { requireCurrentUser } from "@/features/auth/server/auth-session";

export const metadata: Metadata = {
  title: "Profile | Parcel Shipping",
  description:
    "Manage your Parcel Shipping back-office profile.",
};

export default async function ProfilePage() {
  const currentUser =
    await requireCurrentUser();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BackOfficeHeader
        activeSection="profile"
        user={currentUser}
      />

      <main
        id="main-content"
        className="flex min-h-0 flex-1 items-center overflow-hidden px-4 py-5 text-ink sm:px-6 lg:px-8"
      >
        <section className="mx-auto w-full max-w-[1100px]">
          <ProfileWorkspace
            user={currentUser}
          />
        </section>
      </main>
    </div>
  );
}