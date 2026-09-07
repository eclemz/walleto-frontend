"use client";

import { useEffect, useState } from "react";

import { Admin, type AdminView } from "@/components/Admin";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Auth } from "@/components/Auth";
import { Cards } from "@/components/Cards";
import { Dashboard } from "@/components/Dashboard";
import { Deposit, Withdraw } from "@/components/DepositWithdraw";
import { MobileNav } from "@/components/MobileNav";
import { Profile, Settings } from "@/components/ProfileSettings";
import { SendMoney } from "@/components/SendMoney";
import { Sidebar, type AppView } from "@/components/Sidebar";
import { Transactions } from "@/components/Transactions";

type UserRole = "USER" | "ADMIN";
type UserStatus = "ACTIVE" | "SUSPENDED";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [status, setStatus] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [view, setView] = useState<AppView>("dashboard");
  const [loading, setLoading] = useState(true);
  const [adminView, setAdminView] = useState<AdminView>("dashboard");

  async function loadCurrentUser() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setAuthed(false);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Session expired");
      }

      const user = await response.json();
      console.log("CURRENT USER:", user);

      setStatus(user.status);
      setUserName(`${user.firstName} ${user.lastName}`);

      const userRole: UserRole = user.role === "ADMIN" ? "ADMIN" : "USER";

      setRole(userRole);
      setAuthed(true);

      // Admins start directly on the admin dashboard.
      setView(userRole === "ADMIN" ? "admin" : "dashboard");
    } catch {
      localStorage.removeItem("accessToken");
      setAuthed(false);
      setRole(null);
      setView("dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  function handleLogin() {
    loadCurrentUser();
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    setAuthed(false);
    setRole(null);
    setView("dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E5E7EB] border-t-[#3D3BF3] animate-spin" />

          <p className="text-sm text-[#9CA3AF]">Loading Walleto...</p>
        </div>
      </div>
    );
  }

  if (!authed || !role) {
    return <Auth onLogin={handleLogin} />;
  }

  // Prevent a normal user from manually selecting admin.
  function handleViewChange(nextView: AppView) {
    if (nextView === "admin" && role !== "ADMIN") {
      setView("dashboard");
      return;
    }

    setView(nextView);
  }

  const content: Record<AppView, React.ReactNode> = {
    dashboard: (
      <Dashboard onNav={handleViewChange} status={status} userName={userName} />
    ),
    transactions: <Transactions />,
    send: <SendMoney />,
    deposit: <Deposit />,
    withdraw: <Withdraw />,
    cards: <Cards />,
    profile: <Profile />,
    settings: <Settings />,
    admin: <Admin view={adminView} onViewChange={setAdminView} />,
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {role === "ADMIN" ? (
        <AdminSidebar
          active={adminView}
          onChange={setAdminView}
          onLogout={handleLogout}
        />
      ) : (
        <Sidebar
          active={view}
          onChange={handleViewChange}
          role={role}
          onLogout={handleLogout}
        />
      )}

      {content[view]}

      <MobileNav active={view} onChange={handleViewChange} />
    </div>
  );
}
