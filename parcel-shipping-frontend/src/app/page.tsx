import { redirect } from "next/navigation";
import { getOptionalCurrentUser } from "@/features/auth/server/auth-session";

export default async function HomePage() {
  const currentUser =
    await getOptionalCurrentUser();

  redirect(
    currentUser
      ? "/shipments"
      : "/login",
  );
}