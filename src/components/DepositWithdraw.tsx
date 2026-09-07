"use client";

import {
  createFundingSource,
  getFundingSources,
  type FundingSource,
} from "@/lib/fundingSources";
import { requestTransactionOtp } from "@/lib/otp";
import { depositMoney, withdrawMoney } from "@/lib/transactions";
import { useEffect, useState } from "react";
import { Button, Card, Input } from "./ui";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);

function Flow({ mode }: { mode: "deposit" | "withdraw" }) {
  const isDeposit = mode === "deposit";

  // 0 = amount
  // 1 = funding source
  // 2 = OTP
  // 3 = confirmation
  // 4 = processing
  // 5 = success
  const [step, setStep] = useState(0);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState("");

  const [otpChallengeId, setOtpChallengeId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [developmentCode, setDevelopmentCode] = useState("");

  const [showAddSource, setShowAddSource] = useState(false);

  const [newSourceType, setNewSourceType] = useState<"BANK_ACCOUNT" | "CARD">(
    "BANK_ACCOUNT",
  );

  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceLastFour, setNewSourceLastFour] = useState("");
  const [newSourceBankName, setNewSourceBankName] = useState("");
  const [newSourceBrand, setNewSourceBrand] = useState("");

  const [loadingSources, setLoadingSources] = useState(true);
  const [loading, setLoading] = useState(false);
  const [addingSource, setAddingSource] = useState(false);

  const [error, setError] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const amountNum = parseFloat(amount) || 0;

  useEffect(() => {
    loadFundingSources();
  }, []);

  async function loadFundingSources() {
    try {
      setLoadingSources(true);
      setError("");

      const sources = await getFundingSources();

      setFundingSources(sources);

      if (sources.length > 0) {
        setSelectedSourceId(sources[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load funding sources.",
      );
    } finally {
      setLoadingSources(false);
    }
  }

  function reset() {
    setStep(0);
    setAmount("");
    setDescription("");
    setSelectedSourceId("");
    setOtpChallengeId("");
    setOtpCode("");
    setDevelopmentCode("");
    setError("");
    setTransactionId("");

    setShowAddSource(false);
    setNewSourceType("BANK_ACCOUNT");
    setNewSourceName("");
    setNewSourceLastFour("");
    setNewSourceBankName("");
    setNewSourceBrand("");

    if (fundingSources.length > 0) {
      setSelectedSourceId(fundingSources[0].id);
    }
  }

  async function addFundingSource() {
    if (!newSourceName.trim()) {
      setError("Please enter a name for the funding source.");
      return;
    }

    if (newSourceLastFour.length !== 4) {
      setError("Please enter the last 4 digits.");
      return;
    }

    try {
      setAddingSource(true);
      setError("");

      const source = await createFundingSource({
        type: newSourceType,
        name: newSourceName.trim(),
        lastFour: newSourceLastFour,
        ...(newSourceBankName.trim() && {
          bankName: newSourceBankName.trim(),
        }),
        ...(newSourceBrand.trim() && {
          brand: newSourceBrand.trim(),
        }),
      });

      setFundingSources((current) => [source, ...current]);
      setSelectedSourceId(source.id);
      setShowAddSource(false);

      setNewSourceName("");
      setNewSourceLastFour("");
      setNewSourceBankName("");
      setNewSourceBrand("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add funding source.",
      );
    } finally {
      setAddingSource(false);
    }
  }

  async function requestOtp() {
    if (!selectedSourceId) {
      setError(
        isDeposit
          ? "Please select a funding source."
          : "Please select a destination account.",
      );
      return;
    }

    if (amountNum <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const finalDescription =
        description.trim() ||
        `${isDeposit ? "Deposit" : "Withdrawal"} via ${
          selectedSource?.name ?? "funding source"
        }`;

      const response = await requestTransactionOtp({
        purpose: "TRANSACTION",
        operation: isDeposit ? "DEPOSIT" : "WITHDRAWAL",
        amount: amountNum,
        fundingSourceId: selectedSourceId,
        description: finalDescription,
      });

      setOtpChallengeId(response.challengeId);
      setDevelopmentCode(response.developmentCode ?? "");
      setOtpCode("");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function submitTransaction() {
    if (!otpChallengeId) {
      setError("OTP challenge is missing.");
      return;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const finalDescription =
        description.trim() ||
        `${isDeposit ? "Deposit" : "Withdrawal"} via ${
          selectedSource?.name ?? "funding source"
        }`;

      const response = isDeposit
        ? await depositMoney({
            amount: amountNum,
            description: finalDescription,
            fundingSourceId: selectedSourceId,
            otpChallengeId,
            otpCode,
          })
        : await withdrawMoney({
            amount: amountNum,
            description: finalDescription,
            fundingSourceId: selectedSourceId,
            otpChallengeId,
            otpCode,
          });

      setTransactionId(response.transaction.id);

      // Show processing screen first.
      setStep(4);

      // Give the processing state enough time
      // to be visible before showing confirmation.
      setTimeout(() => {
        setStep(5);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `${isDeposit ? "Deposit" : "Withdrawal"} failed. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedSource = fundingSources.find(
    (source) => source.id === selectedSourceId,
  );

  function sourceLabel(source: FundingSource) {
    const provider =
      source.type === "BANK_ACCOUNT"
        ? source.bankName || "Bank Account"
        : source.brand || "Card";

    return `${provider} •••• ${source.lastFour}`;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-[#F9FAFB]/90 backdrop-blur-sm border-b border-[#E5E7EB] px-8 h-14 flex items-center">
        <h1 className="text-base font-semibold text-[#0D0D0E]">
          {isDeposit ? "Deposit" : "Withdraw"}
        </h1>
      </header>

      <div className="px-8 py-8 max-w-130">
        {/* Progress */}
        {step < 4 && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {["Amount", "Funding Source", "OTP", "Confirm"].map(
                (label, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center ${
                        index < step
                          ? "bg-[#16A34A] text-white"
                          : index === step
                            ? "bg-[#3D3BF3] text-white"
                            : "bg-[#F3F4F6] text-[#9CA3AF]"
                      }`}
                    >
                      {index < step ? "✓" : index + 1}
                    </div>

                    <span
                      className={`text-sm ${
                        index === step
                          ? "text-[#0D0D0E] font-medium"
                          : "text-[#9CA3AF]"
                      }`}
                    >
                      {label}
                    </span>

                    {index < 3 && (
                      <div
                        className={`h-px w-8 ${
                          index < step ? "bg-[#16A34A]" : "bg-[#E5E7EB]"
                        }`}
                      />
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step 1: Amount */}
        {step === 0 && (
          <Card className="p-5 space-y-5">
            <div>
              <label className="text-sm font-medium text-[#374151] block mb-1.5">
                Amount (USD)
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-semibold">
                  $
                </span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  className="w-full h-12 pl-7 pr-4 text-2xl font-bold font-mono-financial bg-white border border-[#E5E7EB] rounded-[10px] text-[#0D0D0E] placeholder-[#D1D5DB] outline-none focus:border-[#3D3BF3] focus:ring-2 focus:ring-[#3D3BF3]/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 1000].map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(String(value))}
                  className="h-8 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] hover:border-[#3D3BF3]/40 transition-all"
                >
                  {fmt(value)}
                </button>
              ))}
            </div>

            <Button
              fullWidth
              onClick={() => {
                setError("");
                setStep(1);
              }}
              disabled={amountNum <= 0}
            >
              Continue
            </Button>
          </Card>
        )}

        {/* Step 2: Funding source */}
        {step === 1 && (
          <Card className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[#0D0D0E]">
                {isDeposit ? "Select funding source" : "Select destination"}
              </h3>

              <p className="text-sm text-[#6B7280] mt-1">
                {isDeposit
                  ? "Choose where the money is coming from."
                  : "Choose where the withdrawal is going to."}
              </p>
            </div>

            {loadingSources ? (
              <div className="py-8 text-center text-sm text-[#9CA3AF]">
                Loading funding sources...
              </div>
            ) : fundingSources.length === 0 && !showAddSource ? (
              <div className="rounded-[10px] border border-dashed border-[#D1D5DB] p-6 text-center">
                <p className="text-sm font-medium text-[#374151]">
                  No funding sources yet
                </p>

                <p className="text-xs text-[#9CA3AF] mt-1">
                  Add a bank account or card to continue.
                </p>

                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowAddSource(true)}
                >
                  Add funding source
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {fundingSources.map((source) => (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => {
                      setSelectedSourceId(source.id);
                      setError("");
                    }}
                    className={`w-full text-left rounded-[10px] border p-4 transition-all ${
                      selectedSourceId === source.id
                        ? "border-[#3D3BF3] bg-[#3D3BF3]/5 ring-2 ring-[#3D3BF3]/10"
                        : "border-[#E5E7EB] hover:border-[#9CA3AF]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#0D0D0E]">
                          {source.name}
                        </p>

                        <p className="text-xs text-[#6B7280] mt-1">
                          {sourceLabel(source)}
                        </p>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedSourceId === source.id
                            ? "border-[#3D3BF3] bg-[#3D3BF3]"
                            : "border-[#D1D5DB]"
                        }`}
                      />
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowAddSource(true)}
                  className="w-full h-10 rounded-[10px] border border-dashed border-[#D1D5DB] text-sm font-medium text-[#3D3BF3] hover:bg-[#F9FAFB]"
                >
                  + Add funding source
                </button>
              </div>
            )}

            {showAddSource && (
              <div className="rounded-[10px] border border-[#E5E7EB] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#0D0D0E]">
                    Add funding source
                  </h4>

                  <button
                    type="button"
                    onClick={() => setShowAddSource(false)}
                    className="text-xs text-[#9CA3AF]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSourceType("BANK_ACCOUNT")}
                    className={`flex-1 h-10 rounded-[10px] border text-sm ${
                      newSourceType === "BANK_ACCOUNT"
                        ? "border-[#3D3BF3] bg-[#3D3BF3]/5 text-[#3D3BF3]"
                        : "border-[#E5E7EB] text-[#6B7280]"
                    }`}
                  >
                    Bank account
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewSourceType("CARD")}
                    className={`flex-1 h-10 rounded-[10px] border text-sm ${
                      newSourceType === "CARD"
                        ? "border-[#3D3BF3] bg-[#3D3BF3]/5 text-[#3D3BF3]"
                        : "border-[#E5E7EB] text-[#6B7280]"
                    }`}
                  >
                    Card
                  </button>
                </div>

                <Input
                  label="Name"
                  placeholder={
                    newSourceType === "BANK_ACCOUNT"
                      ? "e.g. My GTBank account"
                      : "e.g. My Visa card"
                  }
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                />

                <Input
                  label="Last 4 digits"
                  placeholder="1234"
                  maxLength={4}
                  value={newSourceLastFour}
                  onChange={(e) =>
                    setNewSourceLastFour(
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                />

                {newSourceType === "BANK_ACCOUNT" && (
                  <Input
                    label="Bank name"
                    placeholder="e.g. GTBank"
                    value={newSourceBankName}
                    onChange={(e) => setNewSourceBankName(e.target.value)}
                  />
                )}

                {newSourceType === "CARD" && (
                  <Input
                    label="Card brand"
                    placeholder="e.g. Visa"
                    value={newSourceBrand}
                    onChange={(e) => setNewSourceBrand(e.target.value)}
                  />
                )}

                <Button
                  fullWidth
                  loading={addingSource}
                  onClick={addFundingSource}
                >
                  Add source
                </Button>
              </div>
            )}

            <Input
              label="Description (optional)"
              placeholder={
                isDeposit ? "Reason for deposit" : "Reason for withdrawal"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep(0)}
                className="flex-1"
              >
                Back
              </Button>

              <Button
                onClick={requestOtp}
                loading={loading}
                disabled={!selectedSourceId}
                className="flex-1"
              >
                Request OTP
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: OTP */}
        {step === 2 && (
          <Card className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[#0D0D0E]">
                Authorise transaction
              </h3>

              <p className="text-sm text-[#6B7280] mt-1">
                Enter the 6-digit OTP to authorise this transaction.
              </p>
            </div>

            <div className="rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#9CA3AF]">Amount</span>

                <span className="font-semibold text-[#0D0D0E]">
                  {fmt(amountNum)}
                </span>
              </div>

              <div className="flex justify-between text-sm mt-3">
                <span className="text-[#9CA3AF]">
                  {isDeposit ? "Funding source" : "Destination"}
                </span>

                <span className="font-medium text-[#374151]">
                  {selectedSource ? sourceLabel(selectedSource) : "—"}
                </span>
              </div>
            </div>

            {developmentCode && (
              <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold text-amber-700">
                  Development OTP
                </p>

                <p className="text-lg font-mono-financial font-bold text-amber-900 mt-1 tracking-widest">
                  {developmentCode}
                </p>

                <p className="text-xs text-amber-700 mt-1">
                  This code is only returned in development.
                </p>
              </div>
            )}

            <Input
              label="OTP"
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>

              <Button
                onClick={() => setStep(3)}
                disabled={!/^\d{6}$/.test(otpCode)}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Confirmation */}
        {step === 3 && (
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#0D0D0E]">
              Confirm {isDeposit ? "Deposit" : "Withdrawal"}
            </h3>

            <div className="space-y-0 divide-y divide-[#F3F4F6]">
              {[
                {
                  label: isDeposit ? "Deposit amount" : "Withdrawal amount",
                  value: fmt(amountNum),
                  bold: true,
                },
                {
                  label: isDeposit ? "Funding source" : "Destination",
                  value: selectedSource ? sourceLabel(selectedSource) : "—",
                },
                ...(description
                  ? [
                      {
                        label: "Description",
                        value: description,
                      },
                    ]
                  : []),
                {
                  label: "OTP",
                  value: "Authorised",
                },
                {
                  label: "Processing",
                  value: "Immediate",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between py-3 text-sm gap-4"
                >
                  <span className="text-[#9CA3AF]">{row.label}</span>

                  <span
                    className={`font-mono-financial text-right ${
                      row.bold ? "font-bold text-[#0D0D0E]" : "text-[#374151]"
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 text-xs text-[#6B7280]">
              Your OTP authorises this exact transaction amount and funding
              source.
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>

              <Button
                onClick={submitTransaction}
                loading={loading}
                className="flex-1"
              >
                Confirm
              </Button>
            </div>
          </Card>
        )}

        {/* Processing */}
        {step === 4 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-[#E5E7EB] border-t-[#3D3BF3] animate-spin" />

            <h2 className="text-xl font-bold text-[#0D0D0E] mb-2">
              Processing {isDeposit ? "Deposit" : "Withdrawal"}
            </h2>

            <p className="text-sm text-[#9CA3AF]">
              Please wait while we process your transaction.
            </p>

            <p className="text-xs text-[#D1D5DB] mt-3 font-mono-financial">
              {fmt(amountNum)}
            </p>
          </div>
        )}

        {/* Success */}
        {step === 5 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center text-2xl mx-auto mb-5">
              ✓
            </div>

            <h2 className="text-xl font-bold text-[#0D0D0E] mb-1">
              {isDeposit ? "Deposit Completed" : "Withdrawal Completed"}
            </h2>

            <p className="text-sm text-[#9CA3AF] mb-1">
              {fmt(amountNum)} {isDeposit ? "deposited" : "withdrawn"}
            </p>

            <p className="text-xs text-[#9CA3AF] mb-2">
              Your wallet balance has been updated.
            </p>

            <p className="text-xs font-mono-financial text-[#6B7280] mb-6 break-all">
              Reference: {transactionId}
            </p>

            <Button onClick={reset} variant="secondary">
              New {isDeposit ? "deposit" : "withdrawal"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Deposit() {
  return <Flow mode="deposit" />;
}

export function Withdraw() {
  return <Flow mode="withdraw" />;
}
