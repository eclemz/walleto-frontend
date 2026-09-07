import { apiFetch } from "./api";

export type Currency = "USD" | "NGN";

export type TransactionDirection = "INCOMING" | "OUTGOING";

export type TransactionType = "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";

export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "REVERSED";

export type TransactionParty = {
  walletNumber: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type Transaction = {
  id: string;
  amount: string | number;
  currency: Currency;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;

  senderWalletId: string | null;
  receiverWalletId: string | null;

  beneficiaryId?: string | null;

  beneficiary?: {
    id: string;
    name: string;
    type: "WALLETO" | "US_DOMESTIC" | "INTERNATIONAL";
    walletNumber?: string | null;
    bankName?: string | null;
    country?: string | null;
    accountNumber?: string | null;
    iban?: string | null;
    swiftBic?: string | null;
  } | null;

  createdAt: string;
  updatedAt?: string;

  direction?: TransactionDirection;

  senderWallet?: TransactionParty | null;
  receiverWallet?: TransactionParty | null;
};

export type TransactionResponse = {
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type TransactionFilters = {
  type?: TransactionType;
  status?: TransactionStatus;
  search?: string;
};

export function getTransactions(
  page = 1,
  limit = 10,
  filters?: TransactionFilters,
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filters?.type) {
    params.set("type", filters.type);
  }

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  return apiFetch<TransactionResponse>(`/transactions?${params.toString()}`);
}

export type TransactionDetails = Transaction & {
  senderWallet: TransactionParty | null;
  receiverWallet: TransactionParty | null;
  direction: TransactionDirection;
};

export function getTransaction(transactionId: string) {
  return apiFetch<TransactionDetails>(
    `/transactions/${encodeURIComponent(transactionId)}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export type DashboardSummary = {
  balance: string | number;
  currency: Currency;
  income: string | number;
  expenses: string | number;
  transfers: number;

  recentTransactions: Transaction[];

  monthlyFlow: {
    month: string;
    income: number;
    expenses: number;
  }[];
};

export function getDashboardSummary() {
  return apiFetch<DashboardSummary>("/transactions/summary");
}

/* -------------------------------------------------------------------------- */
/* Transfers                                                                  */
/* -------------------------------------------------------------------------- */

export type TransferPayload = {
  amount: number;
  description?: string;
  otpChallengeId: string;
  otpCode: string;
  receiverWalletNumber?: string;
  beneficiaryId?: string;
};

export type TransferResponse = {
  transaction: Transaction;

  beneficiary?: Transaction["beneficiary"];

  senderWallet?: {
    id: string;
    walletNumber: string;
    balance: string | number;
    userId: string;
    currency?: Currency;
  };

  receiverWallet?: {
    id: string;
    walletNumber: string;
    balance: string | number;
    userId: string;
    currency?: Currency;
  };

  wallet?: {
    id: string;
    walletNumber: string;
    balance: string | number;
    userId: string;
    currency?: Currency;
  };

  message?: string;
};

export function transferMoney(payload: TransferPayload) {
  return apiFetch<{
    transaction: Transaction;

    beneficiary?: {
      id: string;
      name: string;
      type: "WALLETO" | "US_DOMESTIC" | "INTERNATIONAL";
      walletNumber?: string | null;
      bankName?: string | null;
      country?: string | null;
      accountNumber?: string | null;
    };

    senderWallet: {
      id: string;
      walletNumber: string;
      balance: string | number;
      userId: string;
      currency?: Currency;
    };

    receiverWallet?: {
      id: string;
      walletNumber: string;
      balance: string | number;
      userId: string;
      currency?: Currency;
    };

    message?: string;
  }>("/transactions/transfer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* -------------------------------------------------------------------------- */
/* Deposit                                                                    */
/* -------------------------------------------------------------------------- */

export type DepositPayload = {
  amount: number;
  description?: string;
  fundingSourceId: string;
  otpChallengeId: string;
  otpCode: string;
};

export function depositMoney(payload: DepositPayload) {
  return apiFetch<{
    transaction: Transaction;

    wallet: {
      id: string;
      walletNumber: string;
      balance: string | number;
      userId: string;
      currency?: Currency;
    };
  }>("/transactions/deposit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* -------------------------------------------------------------------------- */
/* Withdrawal                                                                 */
/* -------------------------------------------------------------------------- */

export type WithdrawPayload = {
  amount: number;
  description?: string;
  fundingSourceId: string;
  otpChallengeId: string;
  otpCode: string;
};

export function withdrawMoney(payload: WithdrawPayload) {
  return apiFetch<{
    transaction: Transaction;

    wallet: {
      id: string;
      walletNumber: string;
      balance: string | number;
      userId: string;
      currency?: Currency;
    };
  }>("/transactions/withdraw", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
