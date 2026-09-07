"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getDashboardSummary,
  type DashboardSummary,
  type Transaction,
} from "@/lib/transactions";

import { formatMoney } from "@/lib/formatMoney";
import { getWallet, type Wallet } from "@/lib/wallet";

import type { AppView } from "./Sidebar";
import { Card, StatCard } from "./ui";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getTransactionTitle(transaction: Transaction) {
  if (transaction.type === "DEPOSIT") {
    return "Deposit";
  }

  if (transaction.type === "WITHDRAWAL") {
    return "Withdrawal";
  }

  if (transaction.direction === "INCOMING") {
    return "Incoming transfer";
  }

  return "Outgoing transfer";
}

type UserStatus = "ACTIVE" | "SUSPENDED";

export function Dashboard({
  onNav,
  status,
  userName,
}: {
  onNav: (v: AppView) => void;
  status: string;
  userName: string;
}) {
  const [balanceVisible, setBalanceVisible] = useState(true);

  const [copied, setCopied] = useState(false);

  const [wallet, setWallet] = useState<Wallet | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [walletData, summaryData] = await Promise.all([
          getWallet(),
          getDashboardSummary(),
        ]);

        setWallet(walletData);
        setSummary(summaryData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const copyWallet = () => {
    if (!wallet) return;

    navigator.clipboard.writeText(wallet.walletNumber).catch(() => {});

    setCopied(true);

    setTimeout(() => setCopied(false), 1800);
  };

  const balance = Number(summary?.balance ?? wallet?.balance ?? 0);

  const income = Number(summary?.income ?? 0);

  const expenses = Number(summary?.expenses ?? 0);

  const transfers = summary?.transfers ?? 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#F9FAFB]/90 backdrop-blur-sm border-b border-[#E5E7EB] px-8 h-14 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[#0D0D0E]">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search transactions…"
              onFocus={() => onNav("transactions")}
              className="h-8 pl-8 pr-3 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#0D0D0E] placeholder-[#9CA3AF] outline-none w-52 focus:border-[#3D3BF3] focus:ring-2 focus:ring-[#3D3BF3]/10 transition-all"
            />

            <svg
              className="absolute left-2.5 top-2 w-4 h-4 text-[#9CA3AF]"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="6.5" cy="6.5" r="4.5" />

              <path d="M10 10l3 3" strokeLinecap="round" />
            </svg>
          </div>

          <button className="relative w-8 h-8 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors cursor-pointer">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4 h-4"
            >
              <path
                d="M8 1.5A5.5 5.5 0 0012.5 7v.5c0 1.5.5 2.5 1 3H2.5c.5-.5 1-1.5 1-3V7A4.5 4.5 0 018 2.5"
                strokeLinecap="round"
              />

              <path d="M6.5 12.5a1.5 1.5 0 003 0" />
            </svg>

            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#3D3BF3] rounded-full border-2 border-[#F9FAFB]" />
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-[#E5E7EB]">
            <div className="w-8 h-8 rounded-full bg-[#3D3BF3]/10 text-[#3D3BF3] font-semibold text-sm flex items-center justify-center">
              W
            </div>

            <button
              className="hidden sm:block"
              onClick={() => onNav("profile")}
            >
              <p className="text-sm font-medium text-[#0D0D0E] leading-tight">
                {userName}
              </p>

              <p className="text-xs text-[#16A34A] font-medium leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] inline-block" />
                {status === "ACTIVE" ? "Active" : "Suspended"}
              </p>
            </button>
          </div>
        </div>
      </header>

      <div className="px-8 py-6 max-w-300 space-y-6">
        {/* Error */}
        {error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Wallet + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Wallet */}
          <div className="lg:col-span-2 bg-[#0D0D0E] rounded-2xl p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-[#6B7280] text-xs font-medium uppercase tracking-widest mb-1">
                    Available Balance
                  </p>

                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-bold text-white tracking-tight font-mono-financial">
                      {loading
                        ? "Loading..."
                        : balanceVisible
                          ? formatMoney(balance)
                          : "••••••••"}
                    </p>

                    {!loading && (
                      <button
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="text-[#6B7280] cursor-pointer hover:text-[#9CA3AF] transition-colors text-xs"
                      >
                        {balanceVisible ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-[10px] bg-white/8 flex items-center justify-center">
                  <span className="text-white font-bold text-base">W</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4B5563] text-xs mb-1 uppercase tracking-wider">
                    Account Number
                  </p>

                  <p className="text-[#9CA3AF] text-sm font-mono-financial tracking-widest">
                    {loading ? "Loading..." : wallet?.walletNumber}
                  </p>
                </div>

                <button
                  onClick={copyWallet}
                  disabled={!wallet}
                  className="flex items-center cursor-pointer gap-1.5 px-3 h-7 rounded-lg bg-white/8 hover:bg-white/12 text-[#9CA3AF] hover:text-white text-xs font-medium transition-all disabled:opacity-50"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3">
            {[
              {
                label: "Transfer",
                view: "send" as AppView,
                icon: "→",
                color: "bg-[#3D3BF3]",
                text: "text-white",
              },
              {
                label: "Deposit",
                view: "deposit" as AppView,
                icon: "+",
                color: "bg-[#F3F4F6]",
                text: "text-[#0D0D0E]",
              },
              {
                label: "Cash Withdrawal",
                view: "withdraw" as AppView,
                icon: "↑",
                color: "bg-[#F3F4F6]",
                text: "text-[#0D0D0E]",
              },
              {
                label: "Transactions",
                view: "transactions" as AppView,
                icon: "≡",
                color: "bg-[#F3F4F6]",
                text: "text-[#0D0D0E]",
              },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => onNav(action.view)}
                className={`flex items-center gap-3 px-4 h-12 rounded-xl font-medium text-sm ${action.color} ${action.text} hover:opacity-90 transition-all text-left cursor-pointer`}
              >
                <span className="text-lg font-light">{action.icon}</span>

                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Available Balance"
            value={loading ? "Loading..." : formatMoney(balance)}
            icon="◈"
            accent
          />

          <StatCard
            label="Money In"
            value={loading ? "Loading..." : formatMoney(income)}
            icon="↓"
          />

          <StatCard
            label="Money Out"
            value={loading ? "Loading..." : formatMoney(expenses)}
            icon="↑"
          />

          <StatCard
            label="Transfers"
            value={loading ? "Loading..." : String(transfers)}
            icon="⇌"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0D0D0E]">
                  Balance Trend
                </h3>

                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Monthly money in vs money out
                </p>
              </div>
            </div>

            <div className="h-40">
              {loading ? (
                <div className="h-full flex items-center justify-center text-sm text-[#9CA3AF]">
                  Loading analytics...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary?.monthlyFlow ?? []}>
                    <defs>
                      <linearGradient
                        id="balanceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3D3BF3"
                          stopOpacity={0.25}
                        />

                        <stop
                          offset="100%"
                          stopColor="#3D3BF3"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#F3F4F6" vertical={false} />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: "#9CA3AF",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis hide />

                    <Tooltip
                      formatter={(value) => formatMoney(Number(value ?? 0))}
                    />

                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#3D3BF3"
                      strokeWidth={2}
                      fill="url(#balanceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-[#0D0D0E]">
                Cash Flow
              </h3>

              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Income vs expenses
              </p>
            </div>

            <div className="h-40">
              {loading ? (
                <div className="h-full flex items-center justify-center text-sm text-[#9CA3AF]">
                  Loading analytics...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary?.monthlyFlow ?? []}>
                    <CartesianGrid stroke="#F3F4F6" vertical={false} />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: "#9CA3AF",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis hide />

                    <Tooltip
                      formatter={(value) => formatMoney(Number(value ?? 0))}
                    />

                    <Bar
                      dataKey="income"
                      fill="#3D3BF3"
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="expenses"
                      fill="#D1D5DB"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0D0D0E]">
              Recent Transactions
            </h3>

            <button
              onClick={() => onNav("transactions")}
              className="text-xs text-[#3D3BF3] font-medium cursor-pointer hover:underline"
            >
              View all
            </button>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-[#9CA3AF]">
              Loading transactions...
            </div>
          ) : !summary?.recentTransactions?.length ? (
            <div className="px-5 py-8 text-center text-sm text-[#9CA3AF]">
              No transactions yet.
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {summary.recentTransactions.map((transaction) => {
                const incoming = transaction.direction === "INCOMING";

                return (
                  <div
                    key={transaction.id}
                    className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-[9px] flex items-center justify-center text-sm shrink-0 ${
                          incoming
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                        }`}
                      >
                        {incoming ? "↓" : "↑"}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0D0D0E] truncate">
                          {getTransactionTitle(transaction)}
                        </p>

                        <p className="text-xs text-[#9CA3AF] truncate">
                          {transaction.description ||
                            formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`font-semibold font-mono-financial text-sm ${
                          incoming ? "text-[#16A34A]" : "text-[#0D0D0E]"
                        }`}
                      >
                        {incoming ? "+" : "-"}
                        {formatMoney(Number(transaction.amount))}
                      </p>

                      <p className="text-xs text-[#9CA3AF]">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
