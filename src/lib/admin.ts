import { apiFetch } from "./api";

export type AdminOverview = {
  users: {
    total: number;
    active: number;
  };

  transactions: {
    total: number;
    completed: number;
  };

  volume: {
    deposits: string | number;
    withdrawals: string | number;
    transfers: string | number;
  };

  totalWalletBalance: string | number;

  currency: "USD";
};

export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  role: "CUSTOMER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;

  wallet: {
    walletNumber: string;
    balance: string | number;
    currency: "USD";
  } | null;
};

export type AdminTransaction = {
  id: string;
  amount: string | number;

  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";

  status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";

  description: string | null;

  createdAt: string;

  senderWallet: {
    walletNumber: string;

    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;

  receiverWallet: {
    walletNumber: string;

    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
};

export function getAdminOverview() {
  return apiFetch<AdminOverview>("/admin/overview");
}

export function getAdminUsers() {
  return apiFetch<AdminUser[]>("/admin/users");
}

export function suspendAdminUser(userId: string) {
  return apiFetch<{
    message: string;
    user: AdminUser;
  }>(`/admin/users/${userId}/suspend`, {
    method: "PATCH",
  });
}

export function activateAdminUser(userId: string) {
  return apiFetch<{
    message: string;
    user: AdminUser;
  }>(`/admin/users/${userId}/activate`, {
    method: "PATCH",
  });
}

export function getAdminTransactions() {
  return apiFetch<AdminTransaction[]>("/admin/transactions");
}

export type PendingTransaction = AdminTransaction & {
  beneficiary: {
    id: string;
    name: string;
    type: "WALLETO" | "US_DOMESTIC" | "INTERNATIONAL";
    walletNumber?: string | null;
    bankName?: string | null;
    country?: string | null;
    accountNumber?: string | null;
    iban?: string | null;
    swiftBic?: string | null;
    beneficiaryAddress?: string | null;
  } | null;

  senderWallet: {
    id: string;
    walletNumber: string;
    balance: string | number;
    currency: "USD" | "NGN";
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
};

export function getPendingAdminTransactions() {
  return apiFetch<PendingTransaction[]>("/admin/transactions/pending");
}

export function approveAdminTransaction(transactionId: string) {
  return apiFetch<{
    message: string;
    transaction: PendingTransaction;
    wallet: {
      id: string;
      walletNumber: string;
      balance: string | number;
      userId: string;
      currency: "USD" | "NGN";
    };
  }>(`/admin/transactions/${encodeURIComponent(transactionId)}/approve`, {
    method: "PATCH",
  });
}

export function rejectAdminTransaction(transactionId: string) {
  return apiFetch<{
    message: string;
    transaction: PendingTransaction;
  }>(`/admin/transactions/${encodeURIComponent(transactionId)}/reject`, {
    method: "PATCH",
  });
}
