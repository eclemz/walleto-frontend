"use client";

import { formatMoney } from "@/lib/formatMoney";
import {
  getTransaction,
  getTransactions,
  type Transaction,
  type TransactionDetails,
} from "@/lib/transactions";
import { useEffect, useState } from "react";
import { Badge, Card, Input, Select } from "./ui";

const PAGE_SIZE = 8;

type TypeFilter = "All Types" | "Deposit" | "Withdrawal" | "Transfer";

type StatusFilter =
  | "All Statuses"
  | "Completed"
  | "Pending"
  | "Failed"
  | "Reversed";

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All Types");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All Statuses");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDetails | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      try {
        setLoading(true);
        setError("");

        const type =
          typeFilter === "All Types"
            ? undefined
            : (typeFilter.toUpperCase() as
                | "DEPOSIT"
                | "WITHDRAWAL"
                | "TRANSFER");

        const status =
          statusFilter === "All Statuses"
            ? undefined
            : (statusFilter.toUpperCase() as
                | "PENDING"
                | "COMPLETED"
                | "FAILED"
                | "REVERSED");

        const response = await getTransactions(page, PAGE_SIZE, {
          type,
          status,
          search,
        });

        if (cancelled) return;

        setTransactions(response.data);
        setTotal(response.meta.total);
        setTotalPages(response.meta.totalPages);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Failed to load transactions",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [page, typeFilter, statusFilter, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value as TypeFilter);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  };

  const openTransaction = async (transactionId: string) => {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      setSelectedTransaction(null);

      const transaction = await getTransaction(transactionId);

      setSelectedTransaction(transaction);
    } catch (err) {
      setDetailsError(
        err instanceof Error
          ? err.message
          : "Failed to load transaction details",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeTransaction = () => {
    setSelectedTransaction(null);
    setDetailsError("");
  };

  const statusVariant = (status: Transaction["status"]) => {
    if (status === "COMPLETED") {
      return "success";
    }

    if (status === "PENDING") {
      return "warning";
    }

    return "error";
  };

  const typeColor = (type: Transaction["type"]) => {
    if (type === "DEPOSIT") {
      return "bg-[#DCFCE7] text-[#16A34A]";
    }

    if (type === "WITHDRAWAL") {
      return "bg-[#F3F4F6] text-[#6B7280]";
    }

    return "bg-[#EEF2FF] text-[#3D3BF3]";
  };

  const getTransactionAmount = (tx: Transaction) => {
    const amount = Number(tx.amount);

    return tx.direction === "INCOMING" ? amount : -amount;
  };

  const formatDate = (date: string) => {
    const value = new Date(date);

    return {
      date: value.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),

      time: value.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  };

  const formatFullDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (transaction: Transaction) => {
    if (transaction.type === "DEPOSIT") {
      return "Deposit";
    }

    if (transaction.type === "WITHDRAWAL") {
      return "Withdrawal";
    }

    return transaction.direction === "INCOMING"
      ? "Incoming transfer"
      : "Outgoing transfer";
  };

  const getBeneficiaryDescription = (
    beneficiary: NonNullable<Transaction["beneficiary"]>,
  ) => {
    if (beneficiary.type === "US_DOMESTIC") {
      return [
        beneficiary.bankName,
        beneficiary.accountNumber
          ? `•••• ${beneficiary.accountNumber.slice(-4)}`
          : null,
      ]
        .filter(Boolean)
        .join(" • ");
    }

    if (beneficiary.type === "INTERNATIONAL") {
      return [
        beneficiary.bankName,
        beneficiary.country,
        beneficiary.accountNumber
          ? `•••• ${beneficiary.accountNumber.slice(-4)}`
          : null,
        beneficiary.iban ? `IBAN •••• ${beneficiary.iban.slice(-4)}` : null,
      ]
        .filter(Boolean)
        .join(" • ");
    }

    return beneficiary.walletNumber
      ? `Walleto •••• ${beneficiary.walletNumber.slice(-4)}`
      : "Walleto account";
  };

  const selectedAmount = selectedTransaction
    ? Number(selectedTransaction.amount)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-[#F9FAFB]/90 backdrop-blur-sm border-b border-[#E5E7EB] px-8 h-14 flex items-center">
        <div>
          <h1 className="text-base font-semibold text-[#0D0D0E]">
            Transactions
          </h1>

          <p className="text-xs text-[#9CA3AF]">
            {loading
              ? "Loading transactions..."
              : `${total} transaction${total !== 1 ? "s" : ""}`}
          </p>
        </div>
      </header>

      <div className="px-8 py-6 max-w-250 space-y-5">
        {error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Card className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-50">
              <Input
                label="Search"
                placeholder="Transaction ID or description…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <Select
              label="Type"
              options={["All Types", "Deposit", "Withdrawal", "Transfer"]}
              value={typeFilter}
              onChange={handleTypeFilter}
            />

            <Select
              label="Status"
              options={[
                "All Statuses",
                "Completed",
                "Pending",
                "Failed",
                "Reversed",
              ]}
              value={statusFilter}
              onChange={handleStatusFilter}
            />
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {[
                    "Transaction",
                    "Type",
                    "Date & Time",
                    "Amount",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F3F4F6]">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-[#9CA3AF]"
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-[#9CA3AF]"
                    >
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const amount = getTransactionAmount(tx);

                    const date = formatDate(tx.createdAt);

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => openTransaction(tx.id)}
                        className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${typeColor(
                                tx.type,
                              )}`}
                            >
                              {tx.type === "DEPOSIT"
                                ? "↓"
                                : tx.type === "WITHDRAWAL"
                                  ? "↑"
                                  : "⇄"}
                            </div>

                            <div>
                              <p className="font-medium text-[#0D0D0E]">
                                {getTypeLabel(tx)}
                              </p>

                              {tx.beneficiary && (
                                <p className="text-xs text-[#6B7280] truncate max-w-45">
                                  To {tx.beneficiary.name}
                                </p>
                              )}

                              {tx.description && (
                                <p className="text-xs text-[#9CA3AF] truncate max-w-45">
                                  {tx.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="capitalize text-[#6B7280]">
                            {tx.type.toLowerCase()}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-[#6B7280]">
                          <p>{date.date}</p>
                          <p className="text-xs text-[#9CA3AF]">{date.time}</p>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`font-semibold font-mono-financial ${
                              amount > 0 ? "text-[#16A34A]" : "text-[#0D0D0E]"
                            }`}
                          >
                            {amount > 0 ? "+" : "-"}
                            {formatMoney(Math.abs(amount))}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge variant={statusVariant(tx.status)}>
                            {tx.status.toLowerCase()}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
              <p className="text-xs text-[#9CA3AF]">
                Page {page} of {totalPages} · {total} transactions
              </p>

              <div className="flex gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="w-7 h-7 rounded-[6px] border cursor-pointer border-[#E5E7EB] text-xs text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) => index + 1,
                ).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`w-7 h-7 rounded-[6px] text-xs cursor-pointer font-medium transition-colors ${
                      pageNumber === page
                        ? "bg-[#3D3BF3] text-white"
                        : "border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="w-7 h-7 rounded-[6px] border border-[#E5E7EB] text-xs text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Transaction details */}
      {(selectedTransaction || detailsLoading || detailsError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close transaction details"
            onClick={closeTransaction}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />

          <div className="relative w-full max-w-130 max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-base font-semibold text-[#0D0D0E]">
                  Transaction Details
                </h2>

                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  View transaction information
                </p>
              </div>

              <button
                type="button"
                onClick={closeTransaction}
                className="w-8 h-8 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {detailsLoading && (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 h-8 w-8 rounded-full border-3 border-[#E5E7EB] border-t-[#3D3BF3] animate-spin" />

                <p className="text-sm text-[#9CA3AF]">
                  Loading transaction details...
                </p>
              </div>
            )}

            {!detailsLoading && detailsError && (
              <div className="p-6">
                <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {detailsError}
                </div>
              </div>
            )}

            {!detailsLoading && !detailsError && selectedTransaction && (
              <div className="p-6 space-y-5">
                <div className="text-center py-3">
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-lg ${typeColor(
                      selectedTransaction.type,
                    )}`}
                  >
                    {selectedTransaction.type === "DEPOSIT"
                      ? "↓"
                      : selectedTransaction.type === "WITHDRAWAL"
                        ? "↑"
                        : "⇄"}
                  </div>

                  <p className="text-3xl font-bold font-mono-financial text-[#0D0D0E]">
                    {selectedAmount > 0 ? "+" : "-"}
                    {formatMoney(Math.abs(selectedAmount))}
                  </p>

                  <p className="text-xs text-[#9CA3AF] mt-1">
                    {selectedTransaction.currency}
                  </p>

                  <div className="mt-3">
                    <Badge variant={statusVariant(selectedTransaction.status)}>
                      {selectedTransaction.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E5E7EB] divide-y divide-[#F3F4F6]">
                  <div className="flex justify-between gap-4 px-4 py-3">
                    <span className="text-sm text-[#9CA3AF]">Type</span>

                    <span className="text-sm font-medium text-[#374151]">
                      {getTypeLabel(selectedTransaction)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 px-4 py-3">
                    <span className="text-sm text-[#9CA3AF]">Date</span>

                    <span className="text-sm text-right text-[#374151]">
                      {formatFullDate(selectedTransaction.createdAt)}
                    </span>
                  </div>

                  {selectedTransaction.description && (
                    <div className="flex justify-between gap-4 px-4 py-3">
                      <span className="text-sm text-[#9CA3AF]">
                        Description
                      </span>

                      <span className="text-sm text-right text-[#374151] max-w-65">
                        {selectedTransaction.description}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 px-4 py-3">
                    <span className="text-sm text-[#9CA3AF]">Direction</span>

                    <span className="text-sm font-medium text-[#374151]">
                      {selectedTransaction.direction === "INCOMING"
                        ? "Incoming"
                        : "Outgoing"}
                    </span>
                  </div>
                </div>

                {/* Sender */}
                {selectedTransaction.senderWallet && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                      Sender
                    </p>

                    <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                      <p className="text-sm font-semibold text-[#0D0D0E]">
                        {selectedTransaction.senderWallet.user.firstName}{" "}
                        {selectedTransaction.senderWallet.user.lastName}
                      </p>

                      <p className="text-xs text-[#9CA3AF] mt-1">
                        {selectedTransaction.senderWallet.user.email}
                      </p>

                      <p className="text-xs font-mono-financial text-[#6B7280] mt-2">
                        Wallet {selectedTransaction.senderWallet.walletNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Walleto Receiver */}
                {selectedTransaction.receiverWallet && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                      Receiver
                    </p>

                    <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                      <p className="text-sm font-semibold text-[#0D0D0E]">
                        {selectedTransaction.receiverWallet.user.firstName}{" "}
                        {selectedTransaction.receiverWallet.user.lastName}
                      </p>

                      <p className="text-xs text-[#9CA3AF] mt-1">
                        {selectedTransaction.receiverWallet.user.email}
                      </p>

                      <p className="text-xs font-mono-financial text-[#6B7280] mt-2">
                        Wallet {selectedTransaction.receiverWallet.walletNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* External beneficiary */}
                {selectedTransaction.beneficiary && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                      Beneficiary
                    </p>

                    <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-[#0D0D0E]">
                          {selectedTransaction.beneficiary.name}
                        </p>

                        <p className="text-xs text-[#6B7280] mt-1">
                          {selectedTransaction.beneficiary.type ===
                          "US_DOMESTIC"
                            ? "U.S. Domestic Bank"
                            : selectedTransaction.beneficiary.type ===
                                "INTERNATIONAL"
                              ? "International Bank"
                              : "Walleto Account"}
                        </p>
                      </div>

                      {selectedTransaction.beneficiary.bankName && (
                        <div className="flex justify-between gap-4">
                          <span className="text-xs text-[#9CA3AF]">Bank</span>

                          <span className="text-xs font-medium text-[#374151] text-right">
                            {selectedTransaction.beneficiary.bankName}
                          </span>
                        </div>
                      )}

                      {selectedTransaction.beneficiary.country && (
                        <div className="flex justify-between gap-4">
                          <span className="text-xs text-[#9CA3AF]">
                            Country
                          </span>

                          <span className="text-xs font-medium text-[#374151]">
                            {selectedTransaction.beneficiary.country}
                          </span>
                        </div>
                      )}

                      {selectedTransaction.beneficiary.accountNumber && (
                        <div className="flex justify-between gap-4">
                          <span className="text-xs text-[#9CA3AF]">
                            Account
                          </span>

                          <span className="text-xs font-mono-financial text-[#374151]">
                            ••••{" "}
                            {selectedTransaction.beneficiary.accountNumber.slice(
                              -4,
                            )}
                          </span>
                        </div>
                      )}

                      {selectedTransaction.beneficiary.iban && (
                        <div className="flex justify-between gap-4">
                          <span className="text-xs text-[#9CA3AF]">IBAN</span>

                          <span className="text-xs font-mono-financial text-[#374151]">
                            ••••{" "}
                            {selectedTransaction.beneficiary.iban.slice(-4)}
                          </span>
                        </div>
                      )}

                      {selectedTransaction.beneficiary.swiftBic && (
                        <div className="flex justify-between gap-4">
                          <span className="text-xs text-[#9CA3AF]">
                            SWIFT / BIC
                          </span>

                          <span className="text-xs font-mono-financial text-[#374151]">
                            {selectedTransaction.beneficiary.swiftBic}
                          </span>
                        </div>
                      )}

                      {selectedTransaction.beneficiary.walletNumber && (
                        <div className="flex justify-between gap-4">
                          <span className="text-xs text-[#9CA3AF]">
                            Walleto
                          </span>

                          <span className="text-xs font-mono-financial text-[#374151]">
                            ••••{" "}
                            {selectedTransaction.beneficiary.walletNumber.slice(
                              -4,
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Transaction ID */}
                <div className="pt-2">
                  <p className="text-xs text-[#9CA3AF] mb-1">Transaction ID</p>

                  <p className="text-xs font-mono-financial text-[#6B7280] break-all">
                    {selectedTransaction.id}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
