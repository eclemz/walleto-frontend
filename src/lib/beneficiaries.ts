import { apiFetch } from "./api";

export type BeneficiaryType =
  | "WALLETO"
  | "US_DOMESTIC"
  | "INTERNATIONAL";

export type AccountType =
  | "CHECKING"
  | "SAVINGS";

export type Currency =
  | "NGN"
  | "USD";

export type Beneficiary = {
  id: string;
  userId: string;

  type: BeneficiaryType;

  name: string;

  walletNumber: string | null;

  bankName: string | null;
  bankAddress: string | null;
  country: string | null;
  currency: Currency | null;

  accountNumber: string | null;
  accountType: AccountType | null;
  routingNumber: string | null;

  iban: string | null;
  swiftBic: string | null;
  localBankIdentifier: string | null;

  beneficiaryAddress: string | null;

  purpose: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreateBeneficiaryPayload = {
  type: BeneficiaryType;

  name: string;

  walletNumber?: string;

  bankName?: string;
  bankAddress?: string;
  country?: string;
  currency?: Currency;

  accountNumber?: string;
  accountType?: AccountType;
  routingNumber?: string;

  iban?: string;
  swiftBic?: string;
  localBankIdentifier?: string;

  beneficiaryAddress?: string;

  purpose?: string;
};

export function getBeneficiaries() {
  return apiFetch<Beneficiary[]>(
    "/beneficiaries",
  );
}

export function getBeneficiary(
  beneficiaryId: string,
) {
  return apiFetch<Beneficiary>(
    `/beneficiaries/${encodeURIComponent(
      beneficiaryId,
    )}`,
  );
}

export function createBeneficiary(
  payload: CreateBeneficiaryPayload,
) {
  return apiFetch<Beneficiary>(
    "/beneficiaries",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteBeneficiary(
  beneficiaryId: string,
) {
  return apiFetch<{
    message: string;
  }>(
    `/beneficiaries/${encodeURIComponent(
      beneficiaryId,
    )}`,
    {
      method: "DELETE",
    },
  );
}
