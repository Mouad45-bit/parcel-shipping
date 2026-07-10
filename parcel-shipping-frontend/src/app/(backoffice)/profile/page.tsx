import type { Metadata } from "next";
import { BackOfficeHeader } from "@/components/layout/BackOfficeHeader";
import { ProfileWorkspace } from "@/features/auth/components/ProfileWorkspace";
import type { AuthUser } from "@/features/auth/types/auth";

export const metadata: Metadata = {
  title: "Profile | Parcel Shipping",
  description: "Manage your Parcel Shipping back-office profile.",
};

/*
 * Données temporaires uniquement destinées à construire l'interface.
 * Elles seront remplacées par GET /api/auth/me après le backend JWT.
 */
const currentUser: AuthUser = {
  id: "temporary-user",
  name: "Back Office User",
  username: "backoffice",
  role: "OPERATOR",
};

const roleLabels: Record<AuthUser["role"], string> = {
  ADMIN: "Administrator",
  OPERATOR: "Operator",
};

export default function ProfilePage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BackOfficeHeader
        activeSection="profile"
        userName={currentUser.name}
        userRole={roleLabels[currentUser.role]}
      />

      <main
        id="main-content"
        className="flex min-h-0 flex-1 items-center overflow-hidden px-4 py-5 text-ink sm:px-6 lg:px-8"
      >
        <section className="mx-auto w-full max-w-[1100px]">
          <ProfileWorkspace user={currentUser} />
        </section>
      </main>
    </div>
  );
}