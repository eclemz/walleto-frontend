import { apiFetch } from "./api";

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;

  wallet?: {
    walletNumber: string;
    balance: string | number;
    currency: "USD";
  };
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
};

export function getMyProfile() {
  return apiFetch<UserProfile>("/users/me");
}

export function updateMyProfile(payload: UpdateProfilePayload) {
  return apiFetch<UserProfile>("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function changePassword(payload: ChangePasswordPayload) {
  return apiFetch<{
    message: string;
  }>("/users/change-password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
