import type { ReactNode } from "react";

export type AppView =
  | "dashboard"
  | "transactions"
  | "send"
  | "deposit"
  | "withdraw"
  | "cards"
  | "profile"
  | "settings"
  | "admin";

const navItems: { id: AppView; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <GridIcon /> },
  { id: "transactions", label: "Transactions", icon: <ListIcon /> },
  { id: "send", label: "Transfer", icon: <SendIcon /> },
  { id: "deposit", label: "Deposit", icon: <DownloadIcon /> },
  { id: "withdraw", label: "Cash Withdraw", icon: <UploadIcon /> },
  { id: "cards", label: "Cards", icon: <CardIcon /> },
  { id: "profile", label: "Profile", icon: <UserIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
];

export function Sidebar({
  active,
  onChange,
  role,
  onLogout,
}: {
  active: AppView;
  onChange: (v: AppView) => void;
  role: "USER" | "ADMIN";
  onLogout: () => void;
}) {
  return (
    <aside className="w-55 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-[#E5E7EB] py-6 z-20">
      {/* Logo */}
      {/* < Link to="/dashboard" className="px-5 mb-8"> */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3D3BF3] flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-bold text-[#0D0D0E] text-base tracking-tight">
            Walleto
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left cursor-pointer
              ${
                active === item.id
                  ? "bg-[#3D3BF3]/8 text-[#3D3BF3]"
                  : "text-[#6B7280] hover:text-[#0D0D0E] hover:bg-[#F3F4F6]"
              }`}
          >
            <span
              className={`w-4 h-4 shrink-0 ${active === item.id ? "text-[#3D3BF3]" : "text-[#9CA3AF]"}`}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 mt-4 border-t border-[#E5E7EB] pt-4 flex flex-col gap-0.5">
        {role === "ADMIN" && (
          <button
            onClick={() => onChange("admin")}
            className={`flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left cursor-pointer
      ${
        active === "admin"
          ? "bg-[#3D3BF3]/8 text-[#3D3BF3]"
          : "text-[#6B7280] hover:text-[#0D0D0E] hover:bg-[#F3F4F6]"
      }`}
          >
            <span className="w-4 h-4 shrink-0 text-[#9CA3AF]">
              <AdminIcon />
            </span>
            Admin
          </button>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 h-9 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEE2E2]/40 transition-all duration-150 w-full text-left cursor-pointer"
        >
          <span className="w-4 h-4 shrink-0">
            <LogoutIcon />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function GridIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <line x1="5" y1="4" x2="14" y2="4" />
      <line x1="5" y1="8" x2="14" y2="8" />
      <line x1="5" y1="12" x2="14" y2="12" />
      <circle cx="2" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="2" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="2" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <path
        d="M13 3L7 9M13 3H9M13 3V7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 4H3C2 4 1 5 1 6V13C1 14 2 15 3 15H10C11 15 12 14 12 13V10"
        strokeLinecap="round"
      />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <path
        d="M8 2v8M5 7l3 3 3-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <path
        d="M8 10V2M5 5l3-3 3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <rect x="1" y="3" width="14" height="10" rx="2" />
      <line x1="1" y1="7" x2="15" y2="7" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <circle cx="8" cy="8" r="2.5" />
      <path
        d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <path
        d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10 11l3-3-3-3M13 8H6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function AdminIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-4 h-4"
    >
      <path
        d="M8 1l1.5 3.5L13 5.5l-2.5 2.4.6 3.6L8 9.5l-3.1 2 .6-3.6L3 5.5l3.5-1L8 1z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
