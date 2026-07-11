export type UserRole = "ADMIN" | "OPERATOR";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type LoginFormErrors = Partial<
  Record<keyof LoginCredentials, string>
>;

export type LoginResponse = {
  user: AuthUser;
};

export type ResetPasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ResetPasswordFormErrors = Partial<
  Record<keyof ResetPasswordFormValues, string>
>;

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
