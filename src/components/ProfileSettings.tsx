"use client";

import { useEffect, useState } from "react";
import {
  changePassword,
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "../lib/users";
import { Button, Card, Input, Tabs, Toggle } from "./ui";

export function Profile() {
  const [tab, setTab] = useState("Personal");

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordSaving, setPasswordSaving] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const handleChangePassword = async () => {
    try {
      setPasswordSaving(true);
      setPasswordMessage("");
      setPasswordError("");

      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage("Password changed successfully.");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Unable to change password.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyProfile();

        setProfile(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setPhoneNumber(data.phoneNumber ?? "");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load profile.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const updated = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              ...updated,
            }
          : updated,
      );

      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setEmail(updated.email);
      setPhoneNumber(updated.phoneNumber ?? "");

      setSaved(true);

      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    if (!profile) return;

    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setPhoneNumber(profile.phoneNumber ?? "");

    setError("");
  };

  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    : "U";

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-[#F9FAFB]/90 backdrop-blur-sm border-b border-[#E5E7EB] px-8 h-14 flex items-center">
        <h1 className="text-base font-semibold text-[#0D0D0E]">Profile</h1>
      </header>

      <div className="px-8 py-6 max-w-160 space-y-5">
        {error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#3D3BF3]/10 text-[#3D3BF3] font-bold text-xl flex items-center justify-center">
            {loading ? "…" : initials}
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#0D0D0E]">
              {loading
                ? "Loading..."
                : `${profile?.firstName} ${profile?.lastName}`}
            </h2>

            <p className="text-sm text-[#9CA3AF] truncate">
              {loading ? "Loading..." : profile?.email}
            </p>

            <p className="text-xs font-mono-financial text-[#6B7280] mt-0.5">
              {profile?.wallet?.walletNumber ?? "No wallet"}
            </p>
          </div>

          <Button size="sm" variant="secondary" className="ml-auto" disabled>
            Change photo
          </Button>
        </div>

        <Tabs
          tabs={["Personal", "Security", "Notifications"]}
          active={tab}
          onChange={setTab}
        />

        {tab === "Personal" && (
          <Card className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading || saving}
              />

              <Input
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading || saving}
              />
            </div>

            <Input
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              disabled={loading || saving}
            />

            <Input
              label="Phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="tel"
              disabled={loading || saving}
            />

            <Input label="Country" value="United States" disabled />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={cancel}
                disabled={loading || saving}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={save}
                loading={saving}
                disabled={loading}
              >
                {saved ? "✓ Saved" : "Save changes"}
              </Button>
            </div>
          </Card>
        )}

        {tab === "Security" && (
          <Card className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[#0D0D0E] mb-3">
                Change Password
              </h3>

              <div className="space-y-3">
                <Input
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError("");
                    setPasswordMessage("");
                  }}
                  disabled={passwordSaving}
                />

                <Input
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                    setPasswordMessage("");
                  }}
                  disabled={passwordSaving}
                />

                <Input
                  label="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                    setPasswordMessage("");
                  }}
                  disabled={passwordSaving}
                />
              </div>

              {passwordError && (
                <p className="text-xs text-red-600 mt-3">{passwordError}</p>
              )}

              {passwordMessage && (
                <p className="text-xs text-[#16A34A] mt-3">{passwordMessage}</p>
              )}

              <Button
                size="sm"
                className="mt-4"
                onClick={handleChangePassword}
                loading={passwordSaving}
                disabled={
                  passwordSaving ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                Change password
              </Button>
            </div>

            <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
              {[
                {
                  label: "Two-factor authentication",
                  sub: "Add extra security to your account",
                  on: true,
                },
                {
                  label: "Biometric login",
                  sub: "Use fingerprint or face ID",
                  on: false,
                },
                {
                  label: "Login notifications",
                  sub: "Notify on new device logins",
                  on: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[#374151]">
                      {item.label}
                    </p>

                    <p className="text-xs text-[#9CA3AF]">{item.sub}</p>
                  </div>

                  <Toggle checked={item.on} onChange={() => {}} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "Notifications" && (
          <Card className="p-5 space-y-4">
            {[
              {
                label: "Transaction alerts",
                sub: "Get notified for every transaction",
                on: true,
              },
              {
                label: "Transfer received",
                sub: "When money is sent to your wallet",
                on: true,
              },
              {
                label: "Low balance warning",
                sub: "Alert when balance drops below $500",
                on: false,
              },
              {
                label: "Security alerts",
                sub: "Suspicious activity and login warnings",
                on: true,
              },
              {
                label: "Marketing updates",
                sub: "Product news and feature announcements",
                on: false,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[#374151]">
                    {item.label}
                  </p>

                  <p className="text-xs text-[#9CA3AF]">{item.sub}</p>
                </div>

                <Toggle checked={item.on} onChange={() => {}} />
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-[#F9FAFB]/90 backdrop-blur-sm border-b border-[#E5E7EB] px-8 h-14 flex items-center">
        <h1 className="text-base font-semibold text-[#0D0D0E]">Settings</h1>
      </header>

      <div className="px-8 py-6 max-w-160 space-y-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#0D0D0E] mb-4">
            Preferences
          </h3>

          <div className="space-y-4">
            {[
              {
                label: "Compact mode",
                sub: "Reduce spacing in the interface",
                on: false,
              },
              {
                label: "Dark mode",
                sub: "Use dark theme across the app",
                on: false,
              },
              {
                label: "Hide balance by default",
                sub: "Balance hidden until revealed",
                on: false,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[#374151]">
                    {item.label}
                  </p>

                  <p className="text-xs text-[#9CA3AF]">{item.sub}</p>
                </div>

                <Toggle checked={item.on} onChange={() => {}} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#0D0D0E] mb-4">
            Linked Accounts
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-[#F9FAFB] rounded-[10px] border border-[#E5E7EB]">
              <p className="text-sm font-medium text-[#374151]">
                External bank accounts
              </p>

              <p className="text-xs text-[#9CA3AF] mt-1">
                Bank connection will be integrated when a real payment provider
                is connected.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            className="mt-3 w-full"
            disabled
          >
            + Link bank account
          </Button>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#0D0D0E] mb-1">
            Danger Zone
          </h3>

          <p className="text-xs text-[#9CA3AF] mb-4">
            These actions are permanent and cannot be undone.
          </p>

          <div className="flex gap-3">
            <Button size="sm" variant="ghost" disabled>
              Export data
            </Button>

            <Button size="sm" variant="destructive" disabled>
              Close account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
