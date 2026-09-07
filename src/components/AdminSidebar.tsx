"use client";

import type { AdminView } from "./Admin";

type AdminSidebarProps = {
  active: AdminView;
  onChange: (view: AdminView) => void;
  onLogout: () => void;
};

function OverviewIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function TransactionsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
    >
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
    >
      <path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20" />
      <circle cx="10" cy="7" r="3" />
      <path d="M16 4.5a3 3 0 0 1 0 5.8M17 14a4.5 4.5 0 0 1 3 4.25V20" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03H6v-2.4h.9A1.7 1.7 0 0 0 8.46 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V4h2.4v1.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 10c.18.58.72.97 1.33.97H21v2.4h-.27A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 4v16" />
    </svg>
  );
}

const navItems: {
  id: AdminView;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "dashboard",
    label: "Overview",
    icon: <OverviewIcon />,
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: <TransactionsIcon />,
  },
  {
    id: "pending",
    label: "Pending Transfers",
    icon: <PendingIcon />,
  },
  {
    id: "users",
    label: "Users",
    icon: <UsersIcon />,
  },
];

export function AdminSidebar({
  active,
  onChange,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 h-screen bg-white border-r border-[#E5E7EB] flex-col">
      {/* Brand */}
      <div className="h-16 px-5 flex items-center border-b border-[#F3F4F6]">
        <div>
          <div className="text-lg font-bold tracking-tight text-[#0D0D0E]">
            Walleto
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF] mt-0.5">
            Admin Portal
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.id;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left cursor-pointer ${
                isActive
                  ? "bg-[#3D3BF3]/8 text-[#3D3BF3]"
                  : "text-[#6B7280] hover:text-[#0D0D0E] hover:bg-[#F3F4F6]"
              }`}
            >
              <span
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-[#3D3BF3]" : "text-[#9CA3AF]"
                }`}
              >
                {item.icon}
              </span>

              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[#F3F4F6] space-y-1">
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEE2E2]/40 transition-all duration-150 w-full text-left cursor-pointer"
        >
          <span className="w-4 h-4 shrink-0 text-[#9CA3AF]">
            <LogoutIcon />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}
