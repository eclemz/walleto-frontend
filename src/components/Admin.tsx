"use client";

import { useEffect, useMemo, useState } from "react";

import {
  activateAdminUser,
  approveAdminTransaction,
  getAdminOverview,
  getAdminTransactions,
  getAdminUsers,
  getPendingAdminTransactions,
  rejectAdminTransaction,
  suspendAdminUser,
  type AdminOverview,
  type AdminTransaction,
  type AdminUser,
  type PendingTransaction,
} from "../lib/admin";

import { formatMoney } from "../lib/formatMoney";
import { Badge, Button, Card, Input, Select } from "./ui";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const transactionBadge = (status: AdminTransaction["status"]) => {
  if (status === "COMPLETED") return "success";
  if (status === "PENDING") return "warning";
  return "error";
};

const transactionLabel = (type: AdminTransaction["type"]) => {
  if (type === "DEPOSIT") return "Deposit";
  if (type === "WITHDRAWAL") return "Withdrawal";
  return "Transfer";
};

const beneficiaryTypeLabel = (
  type: "WALLETO" | "US_DOMESTIC" | "INTERNATIONAL" | undefined,
) => {
  if (type === "US_DOMESTIC") {
    return "US Domestic";
  }

  if (type === "INTERNATIONAL") {
    return "International";
  }

  if (type === "WALLETO") {
    return "Walleto";
  }

  return "Unknown";
};

export type AdminView = "dashboard" | "users" | "transactions" | "pending";

export function Admin({
  view,
  onViewChange,
}: {
  view: AdminView;
  onViewChange: (view: AdminView) => void;
}) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);

  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);

  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [pendingLoading, setPendingLoading] = useState(false);

  const [error, setError] = useState("");

  const [pendingError, setPendingError] = useState("");

  async function loadAdminData() {
    try {
      setLoading(true);
      setError("");

      const [overviewData, usersData, transactionsData] = await Promise.all([
        getAdminOverview(),
        getAdminUsers(),
        getAdminTransactions(),
      ]);

      setOverview(overviewData);
      setUsers(usersData);
      setTransactions(transactionsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load admin data.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadPendingTransactions() {
    try {
      setPendingLoading(true);
      setPendingError("");

      const data = await getPendingAdminTransactions();

      setPendingTransactions(data);
    } catch (err) {
      setPendingError(
        err instanceof Error
          ? err.message
          : "Unable to load pending transfers.",
      );
    } finally {
      setPendingLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (view === "pending") {
      loadPendingTransactions();
    }
  }, [view]);

  const pendingCount = pendingTransactions.length;

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-[#F9FAFB]/90 backdrop-blur-sm border-b border-[#E5E7EB] px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3D3BF3]" />

            <span className="text-xs font-medium text-[#3D3BF3] uppercase tracking-wider">
              Admin
            </span>
          </div>

          <span className="text-[#E5E7EB]">|</span>

          <h1 className="text-base font-semibold text-[#0D0D0E]">
            {view === "dashboard"
              ? "Overview"
              : view === "users"
                ? "Users"
                : view === "transactions"
                  ? "All Transactions"
                  : "Pending Transfers"}
          </h1>
        </div>
      </header>

      <div className="px-8 py-6 space-y-5">
        {error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#9CA3AF]">Loading admin data...</p>
          </div>
        ) : (
          <>
            {view === "dashboard" && (
              <AdminDashboard
                overview={overview}
                users={users}
                transactions={transactions}
                onUsers={() => onViewChange("users")}
              />
            )}

            {view === "users" && <UsersTable users={users} />}

            {view === "transactions" && (
              <TransactionsTable transactions={transactions} />
            )}

            {view === "pending" && (
              <PendingTransfersTable
                transactions={pendingTransactions}
                loading={pendingLoading}
                error={pendingError}
                onRefresh={loadPendingTransactions}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

function AdminDashboard({
  overview,
  users,
  transactions,
  onUsers,
}: {
  overview: AdminOverview | null;
  users: AdminUser[];
  transactions: AdminTransaction[];
  onUsers: () => void;
}) {
  if (!overview) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-[#9CA3AF]">No overview data available.</p>
      </Card>
    );
  }

  const deposits = Number(overview.volume.deposits);

  const withdrawals = Number(overview.volume.withdrawals);

  const transfers = Number(overview.volume.transfers);

  const totalVolume = deposits + withdrawals + transfers;

  const percentage = (value: number) =>
    totalVolume > 0 ? Math.round((value / totalVolume) * 100) : 0;

  const stats = [
    {
      label: "Total Users",
      value: overview.users.total.toString(),
      icon: "◉",
      sub: `${overview.users.active} active accounts`,
    },
    {
      label: "Wallet Balance",
      value: formatMoney(Number(overview.totalWalletBalance)),
      icon: "$",
      sub: "Current total",
    },
    {
      label: "Transaction Volume",
      value: formatMoney(totalVolume),
      icon: "⇌",
      sub: `${overview.transactions.completed} completed`,
    },
    {
      label: "Total Transactions",
      value: overview.transactions.total.toString(),
      icon: "#",
      sub: "All statuses",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">
                {stat.label}
              </p>

              <span className="text-base text-[#9CA3AF]">{stat.icon}</span>
            </div>

            <p className="text-2xl font-bold text-[#0D0D0E] tracking-tight font-mono-financial">
              {stat.value}
            </p>

            <p className="text-xs text-[#9CA3AF] mt-1">{stat.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#0D0D0E]">
              Recent Users
            </h3>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#3D3BF3]/10 text-[#3D3BF3] font-semibold text-xs flex items-center justify-center shrink-0">
                  {getInitials(user.firstName, user.lastName)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0D0D0E] truncate">
                    {user.firstName} {user.lastName}
                  </p>

                  <p className="text-xs text-[#9CA3AF] truncate">
                    {user.email}
                  </p>
                </div>

                <Badge variant={user.status === "ACTIVE" ? "success" : "error"}>
                  {user.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-[#E5E7EB]">
            <button
              onClick={onUsers}
              className="text-xs text-[#3D3BF3] font-medium hover:underline"
            >
              View all users
            </button>
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#0D0D0E]">
              Transaction Breakdown
            </h3>
          </div>

          <div className="p-5 space-y-3">
            {[
              {
                label: "Deposits",
                value: deposits,
                color: "bg-[#16A34A]",
              },
              {
                label: "Withdrawals",
                value: withdrawals,
                color: "bg-[#DC2626]",
              },
              {
                label: "Transfers",
                value: transfers,
                color: "bg-[#3D3BF3]",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">{item.label}</span>

                  <span className="font-mono-financial text-[#374151]">
                    {formatMoney(item.value)}
                  </span>
                </div>

                <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      width: `${percentage(item.value)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#0D0D0E]">
            Recent Transactions
          </h3>
        </div>

        <div className="divide-y divide-[#F3F4F6]">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="px-5 py-3 flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-xs text-[#6B7280]">
                {transaction.type === "DEPOSIT"
                  ? "↓"
                  : transaction.type === "WITHDRAWAL"
                    ? "↑"
                    : "⇄"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0D0D0E]">
                  {transaction.description ||
                    transactionLabel(transaction.type)}
                </p>

                <p className="text-xs text-[#9CA3AF]">
                  {formatDateTime(transaction.createdAt)}
                </p>
              </div>

              <span className="font-mono-financial font-semibold text-sm text-[#0D0D0E]">
                {formatMoney(Number(transaction.amount))}
              </span>

              <Badge variant={transactionBadge(transaction.status)}>
                {transaction.status.toLowerCase()}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

function UsersTable({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [localUsers, setLocalUsers] = useState<AdminUser[]>(users);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return localUsers.filter((user) => {
      const name = `${user.firstName} ${user.lastName}`.toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.wallet?.walletNumber.toLowerCase().includes(query);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [localUsers, search, roleFilter]);

  async function handleStatusChange(user: AdminUser) {
    if (user.role === "ADMIN") {
      return;
    }

    const action = user.status === "SUSPENDED" ? "activate" : "suspend";

    const confirmed = window.confirm(
      action === "suspend"
        ? `Suspend ${user.firstName} ${user.lastName}? They will no longer be able to make transactions.`
        : `Activate ${user.firstName} ${user.lastName}? They will be able to make transactions again.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionError("");
      setActionUserId(user.id);

      const response =
        action === "suspend"
          ? await suspendAdminUser(user.id)
          : await activateAdminUser(user.id);

      setLocalUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                status: response.user.status,
              }
            : item,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : `Unable to ${action} user.`,
      );
    } finally {
      setActionUserId(null);
    }
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          options={["All", "CUSTOMER", "ADMIN"]}
          value={roleFilter}
          onChange={setRoleFilter}
        />

        <Button size="sm" variant="secondary" disabled>
          Export
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {[
                  "User",
                  "Email",
                  "Wallet",
                  "Balance",
                  "Role",
                  "Status",
                  "Joined",
                  "Action",
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-[#9CA3AF]"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#3D3BF3]/10 text-[#3D3BF3] font-semibold text-xs flex items-center justify-center">
                          {getInitials(user.firstName, user.lastName)}
                        </div>

                        <span className="font-medium text-[#0D0D0E]">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-[#6B7280]">{user.email}</td>

                    <td className="px-5 py-3.5 font-mono-financial text-xs text-[#6B7280]">
                      {user.wallet?.walletNumber ?? "—"}
                    </td>

                    <td className="px-5 py-3.5 font-mono-financial font-semibold text-[#0D0D0E]">
                      {user.wallet
                        ? formatMoney(Number(user.wallet.balance))
                        : "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge
                        variant={user.role === "ADMIN" ? "info" : "success"}
                      >
                        {user.role}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge
                        variant={user.status === "ACTIVE" ? "success" : "error"}
                      >
                        {user.status}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5 text-[#9CA3AF] text-xs">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-5 py-3.5">
                      {user.role === "ADMIN" ? (
                        <span className="text-xs text-[#9CA3AF]">
                          Protected
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant={
                            user.status === "SUSPENDED" ? "secondary" : "ghost"
                          }
                          disabled={actionUserId === user.id}
                          onClick={() => handleStatusChange(user)}
                        >
                          {actionUserId === user.id
                            ? "Updating..."
                            : user.status === "SUSPENDED"
                              ? "Activate"
                              : "Suspend"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* All transactions                                                           */
/* -------------------------------------------------------------------------- */

function TransactionsTable({
  transactions,
}: {
  transactions: AdminTransaction[];
}) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {["ID", "Type", "Amount", "Status", "Description", "Date"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F3F4F6]">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-[#9CA3AF]"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono-financial text-xs text-[#9CA3AF]">
                    {transaction.id.slice(0, 12)}
                  </td>

                  <td className="px-5 py-3.5 text-[#6B7280]">
                    {transactionLabel(transaction.type)}
                  </td>

                  <td className="px-5 py-3.5 font-mono-financial font-semibold text-[#0D0D0E]">
                    {formatMoney(Number(transaction.amount))}
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge variant={transactionBadge(transaction.status)}>
                      {transaction.status.toLowerCase()}
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5 text-[#6B7280] max-w-55 truncate">
                    {transaction.description || "—"}
                  </td>

                  <td className="px-5 py-3.5 text-[#9CA3AF] text-xs">
                    {formatDateTime(transaction.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Pending transfers                                                          */
/* -------------------------------------------------------------------------- */

function PendingTransfersTable({
  transactions,
  loading,
  error,
  onRefresh,
}: {
  transactions: PendingTransaction[];
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
}) {
  const [actionId, setActionId] = useState<string | null>(null);

  const [actionError, setActionError] = useState("");

  const [actionSuccess, setActionSuccess] = useState("");

  async function handleApprove(transaction: PendingTransaction) {
    const confirmed = window.confirm(
      `Approve this ${beneficiaryTypeLabel(
        transaction.beneficiary!.type,
      )} transfer of ${formatMoney(Number(transaction.amount))}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(transaction.id);
      setActionError("");
      setActionSuccess("");

      const response = await approveAdminTransaction(transaction.id);

      setActionSuccess(
        response.message || "Transaction approved successfully.",
      );

      await onRefresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to approve transaction.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(transaction: PendingTransaction) {
    const confirmed = window.confirm(
      `Reject this transfer of ${formatMoney(Number(transaction.amount))}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(transaction.id);
      setActionError("");
      setActionSuccess("");

      const response = await rejectAdminTransaction(transaction.id);

      setActionSuccess(
        response.message || "Transaction rejected successfully.",
      );

      await onRefresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to reject transaction.",
      );
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <Card className="p-10 text-center">
        <div className="mx-auto mb-3 w-6 h-6 border-2 border-[#E5E7EB] border-t-[#3D3BF3] rounded-full animate-spin" />

        <p className="text-sm text-[#9CA3AF]">Loading pending transfers...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {actionError && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-[10px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0D0D0E]">
            Pending Transfers
          </h2>

          <p className="text-sm text-[#9CA3AF] mt-1">
            Review and process external transfers awaiting approval.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          disabled={loading || actionId !== null}
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </div>

      {transactions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] text-lg mb-3">
            ✓
          </div>

          <p className="text-sm font-medium text-[#374151]">
            No pending transfers
          </p>

          <p className="text-xs text-[#9CA3AF] mt-1">
            All external transfers have been processed.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const beneficiary = transaction.beneficiary;

            const sender = transaction.senderWallet;

            const busy = actionId === transaction.id;

            return (
              <Card key={transaction.id} className="overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                      ⇄
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#0D0D0E]">
                        External Transfer
                      </p>

                      <p className="text-xs text-[#9CA3AF]">
                        {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Badge variant="warning">pending</Badge>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1">
                        Amount
                      </p>

                      <p className="text-xl font-bold font-mono-financial text-[#0D0D0E]">
                        {formatMoney(Number(transaction.amount))}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1">
                        Sender
                      </p>

                      <p className="text-sm font-medium text-[#0D0D0E]">
                        {sender?.user
                          ? `${sender.user.firstName} ${sender.user.lastName}`
                          : "Unknown"}
                      </p>

                      <p className="text-xs text-[#9CA3AF]">
                        {sender?.user?.email || "—"}
                      </p>

                      <p className="text-xs font-mono-financial text-[#9CA3AF] mt-1">
                        {sender?.walletNumber || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1">
                        Beneficiary
                      </p>

                      <p className="text-sm font-medium text-[#0D0D0E]">
                        {beneficiary?.name || "Unknown beneficiary"}
                      </p>

                      {beneficiary && (
                        <Badge variant="info">
                          {beneficiaryTypeLabel(beneficiary.type)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {beneficiary && (
                    <div className="mt-5 pt-5 border-t border-[#F3F4F6]">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {beneficiary.bankName && (
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                              Bank
                            </p>

                            <p className="text-sm text-[#374151] mt-1">
                              {beneficiary.bankName}
                            </p>
                          </div>
                        )}

                        {beneficiary.country && (
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                              Country
                            </p>

                            <p className="text-sm text-[#374151] mt-1">
                              {beneficiary.country}
                            </p>
                          </div>
                        )}

                        {beneficiary.accountNumber && (
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                              Account
                            </p>

                            <p className="text-sm font-mono-financial text-[#374151] mt-1">
                              ••••
                              {beneficiary.accountNumber.slice(-4)}
                            </p>
                          </div>
                        )}

                        {beneficiary.iban && (
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                              IBAN
                            </p>

                            <p className="text-sm font-mono-financial text-[#374151] mt-1 truncate">
                              {beneficiary.iban}
                            </p>
                          </div>
                        )}

                        {beneficiary.swiftBic && (
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                              SWIFT / BIC
                            </p>

                            <p className="text-sm font-mono-financial text-[#374151] mt-1">
                              {beneficiary.swiftBic}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {transaction.description && (
                    <div className="mt-5 pt-5 border-t border-[#F3F4F6]">
                      <p className="text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1">
                        Description
                      </p>

                      <p className="text-sm text-[#374151]">
                        {transaction.description}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 pt-5 border-t border-[#F3F4F6] flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => handleReject(transaction)}
                    >
                      {busy ? "Processing..." : "Reject"}
                    </Button>

                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => handleApprove(transaction)}
                    >
                      {busy ? "Processing..." : "Approve Transfer"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
