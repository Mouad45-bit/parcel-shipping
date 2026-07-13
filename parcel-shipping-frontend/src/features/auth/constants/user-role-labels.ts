import type { UserRole } from "@/features/auth/types/auth";

export const userRoleLabels: Record<
  UserRole,
  string
> = {
  ADMIN: "Administrator",
  OPERATOR: "Operator",
};
