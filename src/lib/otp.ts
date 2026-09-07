import { apiFetch } from "./api";

export type TransactionOperation = "TRANSFER" | "DEPOSIT" | "WITHDRAWAL";

export type RequestTransactionOtpPayload = {
  purpose: "TRANSACTION";
  operation: TransactionOperation;
  amount: number;
  receiverWalletNumber?: string;
  fundingSourceId?: string;
  description?: string;
};

export type OtpResponse = {
  challengeId: string;
  expiresAt: string;
  developmentCode?: string;
};

export function requestTransactionOtp(payload: RequestTransactionOtpPayload) {
  return apiFetch<OtpResponse>("/otp/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
