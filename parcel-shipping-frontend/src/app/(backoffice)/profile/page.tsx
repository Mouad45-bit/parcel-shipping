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
    <div className="min-h-dvh bg-page">
      <BackOfficeHeader
        activeSection="profile"
        user={currentUser}
      />

      <main
        id="main-content"
        className="px-4 py-8 text-ink sm:px-6 lg:px-8"
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
