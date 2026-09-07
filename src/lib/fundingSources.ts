import { apiFetch } from "./api";

export type FundingSourceType =
  | "BANK_ACCOUNT"
  | "CARD";

export type FundingSource = {
  id: string;
  type: FundingSourceType;
  name: string;
  lastFour: string;
  bankName: string | null;
  brand: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFundingSourcePayload = {
  type: FundingSourceType;
  name: string;
  lastFour: string;
  bankName?: string;
  brand?: string;
};

export function getFundingSources() {
  return apiFetch<FundingSource[]>(
    "/funding-sources",
  );
}

export function createFundingSource(
  payload: CreateFundingSourcePayload,
) {
  return apiFetch<FundingSource>(
    "/funding-sources",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteFundingSource(
  fundingSourceId: string,
) {
  return apiFetch<{
    message: string;
  }>(
    `/funding-sources/${encodeURIComponent(
      fundingSourceId,
    )}`,
    {
      method: "DELETE",
    },
  );
}
