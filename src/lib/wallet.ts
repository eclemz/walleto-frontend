import { apiFetch } from "./api";

export type Wallet = {
  id: string;
  walletNumber: string;
  balance: string | number;
  currency: "USD";
  userId: string;
};

export type Recipient = {
  walletNumber: string;
  firstName: string;
  lastName: string;
};

export function getWallet() {
  return apiFetch<Wallet>("/wallet");
}

export function getRecipient(walletNumber: string) {
  return apiFetch<Recipient>(
    `/wallet/recipient/${encodeURIComponent(walletNumber)}`,
  );
}
