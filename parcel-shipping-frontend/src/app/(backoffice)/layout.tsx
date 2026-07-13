import type { ReactNode } from "react";
import { requireCurrentUser } from "@/features/auth/server/auth-session";

type BackOfficeLayoutProps = {
  children: ReactNode;
};

export default async function BackOfficeLayout({
  children,
}: BackOfficeLayoutProps) {
  await requireCurrentUser();

  return children;
}
