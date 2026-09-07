"use client";

import { useState } from "react";

import {
  createBeneficiary,
  getBeneficiaries,
  type AccountType,
  type Beneficiary,
  type CreateBeneficiaryPayload,
} from "@/lib/beneficiaries";
import { formatMoney } from "@/lib/formatMoney";
import { requestTransactionOtp } from "@/lib/otp";
import { transferMoney, type TransactionStatus } from "@/lib/transactions";
import { getRecipient, type Recipient } from "@/lib/wallet";

import { Button, Card, Input } from "./ui";

type TransferType = "WALLETO" | "BANK";
type BankType = "US_DOMESTIC" | "INTERNATIONAL";

const FEE = 0.5;

export function SendMoney() {
  const [transferType, setTransferType] = useState<TransferType>("WALLETO");

  const [step, setStep] = useState(0);

  const [wallet, setWallet] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);

  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const [showBeneficiaries, setShowBeneficiaries] = useState(false);

  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);

  const [bankType, setBankType] = useState<BankType>("US_DOMESTIC");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [otpCode, setOtpCode] = useState("");
  const [otpChallengeId, setOtpChallengeId] = useState("");

  const [developmentCode, setDevelopmentCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [processingTransfer, setProcessingTransfer] = useState(false);

  const [error, setError] = useState("");

  const [transactionId, setTransactionId] = useState("");

  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus | null>(null);

  // Beneficiary form
  const [beneficiaryName, setBeneficiaryName] = useState("");

  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");

  const [bankName, setBankName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");

  const [accountNumber, setAccountNumber] = useState("");

  const [accountType, setAccountType] = useState<AccountType>("CHECKING");

  const [country, setCountry] = useState("");

  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");

  const [iban, setIban] = useState("");
  const [swiftBic, setSwiftBic] = useState("");

  const amountNum = parseFloat(amount) || 0;
  const total = amountNum + FEE;

  const resetErrors = () => {
    setError("");
  };

  const findRecipient = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getRecipient(wallet.trim());

      setRecipient(result);
      setBeneficiary(null);
      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Recipient account not found",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getBeneficiaries();

      setBeneficiaries(result);
      setShowBeneficiaries(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load beneficiaries",
      );
    } finally {
      setLoading(false);
    }
  };

  const saveBeneficiary = async () => {
    try {
      setLoading(true);
      setError("");

      let payload: CreateBeneficiaryPayload;

      if (bankType === "US_DOMESTIC") {
        payload = {
          type: "US_DOMESTIC",
          name: beneficiaryName.trim(),
          beneficiaryAddress: beneficiaryAddress.trim(),
          bankName: bankName.trim(),
          routingNumber: routingNumber.trim(),
          accountNumber: accountNumber.trim(),
          accountType,
          currency: "USD",
        };
      } else {
        payload = {
          type: "INTERNATIONAL",
          name: beneficiaryName.trim(),
          beneficiaryAddress: beneficiaryAddress.trim(),
          bankName: bankName.trim(),
          country: country.trim(),
          currency,
          accountNumber: accountNumber.trim() || undefined,
          iban: iban.trim() || undefined,
          swiftBic: swiftBic.trim() || undefined,
        };
      }

      const created = await createBeneficiary(payload);

      setBeneficiary(created);
      setRecipient(null);
      setShowAddBeneficiary(false);

      setBeneficiaryName("");
      setBeneficiaryAddress("");
      setBankName("");
      setRoutingNumber("");
      setAccountNumber("");
      setCountry("");
      setIban("");
      setSwiftBic("");

      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save beneficiary",
      );
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    try {
      setLoading(true);
      setError("");

      if (!recipient && !beneficiary) {
        throw new Error("Recipient information is missing.");
      }

      const response = await requestTransactionOtp({
        purpose: "TRANSACTION",
        operation: "TRANSFER",
        amount: amountNum,

        ...(recipient
          ? {
              receiverWalletNumber: recipient.walletNumber,
            }
          : {
              beneficiaryId: beneficiary!.id,
            }),

        description: description.trim() || undefined,
      });

      setOtpChallengeId(response.challengeId);

      setDevelopmentCode(response.developmentCode || "");

      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const submitTransfer = async () => {
    try {
      setLoading(true);
      setError("");

      if (!recipient && !beneficiary) {
        throw new Error("Recipient information is missing.");
      }

      if (!otpChallengeId) {
        throw new Error("OTP challenge is missing.");
      }

      if (otpCode.trim().length !== 6) {
        throw new Error("Enter the 6-digit OTP.");
      }

      /*
       * Show processing immediately.
       */
      setProcessingTransfer(true);

      /*
       * Build the correct payload depending
       * on whether this is a Walleto or
       * external beneficiary transfer.
       */
      const payload = {
        amount: amountNum,

        description: description.trim() || undefined,

        otpChallengeId,

        otpCode: otpCode.trim(),

        ...(beneficiary
          ? {
              beneficiaryId: beneficiary.id,
            }
          : {
              receiverWalletNumber: recipient!.walletNumber,
            }),
      };

      const response = await transferMoney(payload);

      /*
       * Save the actual transaction result.
       */
      setTransactionId(response.transaction.id);

      setTransactionStatus(response.transaction.status);

      /*
       * Keep the processing screen visible
       * for at least one second.
       */
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProcessingTransfer(false);
      setStep(6);
    } catch (err) {
      setProcessingTransfer(false);

      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const back = () => {
    setError("");

    setStep((current) => Math.max(0, current - 1));
  };

  const reset = () => {
    setStep(0);
    setTransferType("WALLETO");

    setWallet("");
    setRecipient(null);
    setBeneficiary(null);

    setAmount("");
    setDescription("");

    setOtpCode("");
    setOtpChallengeId("");
    setDevelopmentCode("");

    setTransactionId("");
    setTransactionStatus(null);
    setProcessingTransfer(false);

    setShowBeneficiaries(false);
    setShowAddBeneficiary(false);

    setError("");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-[#F9FAFB]/90 backdrop-blur-sm border-b border-[#E5E7EB] px-8 h-14 flex items-center">
        <h1 className="text-base font-semibold text-[#0D0D0E]">Transfer</h1>
      </header>

      <div className="px-8 py-8 max-w-130">
        {error && (
          <div className="mb-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* PROCESSING */}
        {processingTransfer && (
          <div className="min-h-105 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-6 h-12 w-12 rounded-full border-4 border-[#E5E7EB] border-t-[#3D3BF3] animate-spin" />

              <h2 className="text-xl font-bold text-[#0D0D0E]">
                Processing transfer
              </h2>

              <p className="text-sm text-[#6B7280] mt-2">
                Please don't close this window.
              </p>
            </div>
          </div>
        )}

        {/* NORMAL TRANSFER FLOW */}
        {!processingTransfer && (
          <>
            {/* Destination */}
            {step === 0 && (
              <Card className="p-5 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-[#0D0D0E]">
                    Where are you transferring to?
                  </h2>

                  <p className="text-sm text-[#6B7280] mt-1">
                    Choose the destination for this transfer.
                  </p>
                </div>

                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTransferType("WALLETO");
                      setError("");
                    }}
                    className={`text-left p-4 rounded-xl border transition ${
                      transferType === "WALLETO"
                        ? "border-[#3D3BF3] bg-[#3D3BF3]/5"
                        : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    <p className="font-semibold text-[#0D0D0E]">
                      Walleto account
                    </p>

                    <p className="text-sm text-[#6B7280] mt-1">
                      Transfer instantly to another Walleto customer.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTransferType("BANK");
                      setError("");
                    }}
                    className={`text-left p-4 rounded-xl border transition ${
                      transferType === "BANK"
                        ? "border-[#3D3BF3] bg-[#3D3BF3]/5"
                        : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    <p className="font-semibold text-[#0D0D0E]">Bank account</p>

                    <p className="text-sm text-[#6B7280] mt-1">
                      Transfer to a U.S. or international bank account.
                    </p>
                  </button>
                </div>

                {transferType === "WALLETO" && (
                  <>
                    <Input
                      label="Walleto Account Number"
                      placeholder="1234567890"
                      value={wallet}
                      onChange={(event) => {
                        setWallet(event.target.value);
                        resetErrors();
                      }}
                      hint="Enter the recipient's Walleto account number."
                    />

                    <Button
                      fullWidth
                      onClick={findRecipient}
                      disabled={wallet.trim().length < 10}
                      loading={loading}
                    >
                      Find Recipient
                    </Button>
                  </>
                )}

                {transferType === "BANK" && (
                  <div className="space-y-3">
                    <Button
                      fullWidth
                      onClick={loadBeneficiaries}
                      variant="secondary"
                      loading={loading}
                    >
                      Choose Saved Beneficiary
                    </Button>

                    <Button
                      fullWidth
                      onClick={() => setShowAddBeneficiary(true)}
                    >
                      Add New Beneficiary
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Saved beneficiaries */}
            {showBeneficiaries && (
              <Card className="mt-4 p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-[#0D0D0E]">
                    Saved Beneficiaries
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowBeneficiaries(false)}
                    className="text-sm text-[#6B7280]"
                  >
                    Close
                  </button>
                </div>

                {beneficiaries.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">
                    You don't have any saved beneficiaries yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {beneficiaries.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setBeneficiary(item);
                          setRecipient(null);
                          setShowBeneficiaries(false);
                          setStep(2);
                        }}
                        className="w-full text-left p-4 rounded-xl border border-[#E5E7EB] hover:border-[#3D3BF3] transition"
                      >
                        <p className="font-semibold text-[#0D0D0E]">
                          {item.name}
                        </p>

                        <p className="text-xs text-[#6B7280] mt-1">
                          {item.type === "US_DOMESTIC"
                            ? `${item.bankName || "Bank"} •••• ${
                                item.accountNumber?.slice(-4) || ""
                              }`
                            : item.type === "INTERNATIONAL"
                              ? `${item.bankName || "Bank"} • ${
                                  item.country || ""
                                }`
                              : `Walleto •••• ${
                                  item.walletNumber?.slice(-4) || ""
                                }`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Add beneficiary */}
            {showAddBeneficiary && (
              <Card className="mt-4 p-5 space-y-5">
                <div>
                  <h3 className="font-semibold text-[#0D0D0E]">
                    Add Beneficiary
                  </h3>

                  <p className="text-sm text-[#6B7280] mt-1">
                    Save a bank account for future transfers.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={
                      bankType === "US_DOMESTIC" ? "primary" : "secondary"
                    }
                    onClick={() => setBankType("US_DOMESTIC")}
                    className="flex-1"
                  >
                    U.S. Domestic
                  </Button>

                  <Button
                    variant={
                      bankType === "INTERNATIONAL" ? "primary" : "secondary"
                    }
                    onClick={() => setBankType("INTERNATIONAL")}
                    className="flex-1"
                  >
                    International
                  </Button>
                </div>

                <Input
                  label="Beneficiary Name"
                  value={beneficiaryName}
                  onChange={(event) => setBeneficiaryName(event.target.value)}
                />

                <Input
                  label="Beneficiary Address"
                  value={beneficiaryAddress}
                  onChange={(event) =>
                    setBeneficiaryAddress(event.target.value)
                  }
                />

                <Input
                  label="Bank Name"
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                />

                {bankType === "US_DOMESTIC" && (
                  <>
                    <Input
                      label="ABA / Routing Number"
                      placeholder="9 digits"
                      value={routingNumber}
                      onChange={(event) => setRoutingNumber(event.target.value)}
                    />

                    <Input
                      label="Account Number"
                      value={accountNumber}
                      onChange={(event) => setAccountNumber(event.target.value)}
                    />

                    <div>
                      <label className="text-sm font-medium text-[#374151] block mb-1.5">
                        Account Type
                      </label>

                      <select
                        value={accountType}
                        onChange={(event) =>
                          setAccountType(event.target.value as AccountType)
                        }
                        className="w-full h-12 px-3 border border-[#E5E7EB] rounded-[10px] bg-white"
                      >
                        <option value="CHECKING">Checking</option>

                        <option value="SAVINGS">Savings</option>
                      </select>
                    </div>
                  </>
                )}

                {bankType === "INTERNATIONAL" && (
                  <>
                    <Input
                      label="Country"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                    />

                    <div>
                      <label className="text-sm font-medium text-[#374151] block mb-1.5">
                        Currency
                      </label>

                      <select
                        value={currency}
                        onChange={(event) =>
                          setCurrency(event.target.value as "USD" | "NGN")
                        }
                        className="w-full h-12 px-3 border border-[#E5E7EB] rounded-[10px] bg-white"
                      >
                        <option value="USD">USD</option>

                        <option value="NGN">NGN</option>
                      </select>
                    </div>

                    <Input
                      label="IBAN (if applicable)"
                      value={iban}
                      onChange={(event) => setIban(event.target.value)}
                    />

                    <Input
                      label="SWIFT / BIC"
                      value={swiftBic}
                      onChange={(event) => setSwiftBic(event.target.value)}
                    />

                    <Input
                      label="Account Number (if applicable)"
                      value={accountNumber}
                      onChange={(event) => setAccountNumber(event.target.value)}
                    />
                  </>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddBeneficiary(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={saveBeneficiary}
                    loading={loading}
                    className="flex-1"
                    disabled={!beneficiaryName.trim() || !bankName.trim()}
                  >
                    Save Beneficiary
                  </Button>
                </div>
              </Card>
            )}

            {/* Confirm recipient */}
            {step === 2 && (recipient || beneficiary) && (
              <Card className="mt-5 p-5 space-y-5">
                <h2 className="text-lg font-bold">Confirm Recipient</h2>

                <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                  {recipient ? (
                    <>
                      <p className="font-semibold">
                        {recipient.firstName} {recipient.lastName}
                      </p>

                      <p className="text-xs font-mono-financial text-[#6B7280] mt-1">
                        Walleto • {recipient.walletNumber}
                      </p>
                    </>
                  ) : beneficiary ? (
                    <>
                      <p className="font-semibold">{beneficiary.name}</p>

                      <p className="text-xs text-[#6B7280] mt-1">
                        {beneficiary.type === "US_DOMESTIC"
                          ? `${beneficiary.bankName || "Bank"} •••• ${
                              beneficiary.accountNumber?.slice(-4) || ""
                            }`
                          : beneficiary.type === "INTERNATIONAL"
                            ? `${beneficiary.bankName || "Bank"} • ${
                                beneficiary.country || ""
                              }`
                            : `Walleto •••• ${
                                beneficiary.walletNumber?.slice(-4) || ""
                              }`}
                      </p>
                    </>
                  ) : null}
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={back} className="flex-1">
                    Back
                  </Button>

                  <Button onClick={() => setStep(3)} className="flex-1">
                    Confirm Recipient
                  </Button>
                </div>
              </Card>
            )}

            {/* Amount */}
            {step === 3 && (
              <Card className="mt-5 p-5 space-y-5">
                <Input
                  label="Amount"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    resetErrors();
                  }}
                  placeholder="0.00"
                />

                {amountNum > 0 && (
                  <p className="text-xs text-[#9CA3AF]">
                    Transfer fee: {formatMoney(FEE)} · Total:{" "}
                    {formatMoney(total)}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={back} className="flex-1">
                    Back
                  </Button>

                  <Button
                    onClick={() => setStep(4)}
                    disabled={amountNum <= 0}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </Card>
            )}

            {/* Description */}
            {step === 4 && (
              <Card className="mt-5 p-5 space-y-5">
                <Input
                  label="Description (optional)"
                  placeholder="What's this transfer for?"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={back} className="flex-1">
                    Back
                  </Button>

                  <Button
                    onClick={requestOtp}
                    loading={loading}
                    className="flex-1"
                  >
                    Request OTP
                  </Button>
                </div>
              </Card>
            )}

            {/* OTP */}
            {step === 5 && (
              <Card className="mt-5 p-5 space-y-5">
                <div>
                  <h2 className="text-lg font-bold">Verify Transfer</h2>

                  <p className="text-sm text-[#6B7280] mt-1">
                    Enter the 6-digit OTP sent to you.
                  </p>
                </div>

                {developmentCode && (
                  <div className="rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] p-4">
                    <p className="text-xs text-[#6B7280]">Development OTP</p>

                    <p className="font-mono-financial font-bold text-lg mt-1">
                      {developmentCode}
                    </p>
                  </div>
                )}

                <Input
                  label="OTP Code"
                  placeholder="123456"
                  value={otpCode}
                  maxLength={6}
                  onChange={(event) =>
                    setOtpCode(event.target.value.replace(/\D/g, ""))
                  }
                />

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={back} className="flex-1">
                    Back
                  </Button>

                  <Button
                    onClick={submitTransfer}
                    loading={loading}
                    disabled={otpCode.length !== 6}
                    className="flex-1"
                  >
                    Confirm Transfer
                  </Button>
                </div>
              </Card>
            )}

            {/* Final transaction status */}
            {step === 6 && (
              <div className="text-center py-8">
                {transactionStatus === "COMPLETED" && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center text-2xl mx-auto mb-5">
                      ✓
                    </div>

                    <h2 className="text-xl font-bold text-[#0D0D0E] mb-1">
                      Transfer Completed
                    </h2>

                    <p className="text-sm text-[#6B7280]">
                      {formatMoney(amountNum)} transferred successfully.
                    </p>
                  </>
                )}

                {transactionStatus === "PENDING" && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#FEF3C7] flex items-center justify-center text-2xl mx-auto mb-5">
                      ⏳
                    </div>

                    <h2 className="text-xl font-bold text-[#0D0D0E] mb-1">
                      Transfer Submitted
                    </h2>

                    <p className="text-sm text-[#6B7280]">
                      Your transfer has been submitted and is awaiting
                      processing.
                    </p>
                  </>
                )}

                {transactionStatus === "FAILED" && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#FEE2E2] flex items-center justify-center text-2xl mx-auto mb-5">
                      ×
                    </div>

                    <h2 className="text-xl font-bold text-[#0D0D0E] mb-1">
                      Transfer Failed
                    </h2>

                    <p className="text-sm text-[#6B7280]">
                      We couldn't complete this transfer.
                    </p>
                  </>
                )}

                {transactionId && (
                  <p className="text-xs text-[#9CA3AF] mt-4 mb-6">
                    Transaction ID:{" "}
                    <span className="font-mono-financial">{transactionId}</span>
                  </p>
                )}

                <Button onClick={reset} variant="secondary">
                  Make Another Transfer
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
