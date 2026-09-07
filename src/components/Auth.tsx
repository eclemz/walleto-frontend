"use client";

import { useState } from "react";
import { Button, Input, PasswordInput } from "./ui";

type Mode = "login" | "register" | "forgot";

type AuthProps = {
  onLogin: () => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<Mode>("login");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data.message === "string"
              ? data.message
              : "Invalid email or password",
          );
        }

        if (!data.accessToken) {
          throw new Error("Login succeeded but no access token was returned.");
        }

        localStorage.setItem("accessToken", data.accessToken);

        onLogin();

        return;
      }

      if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phoneNumber: form.phoneNumber,
            password: form.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data.message === "string"
              ? data.message
              : "Registration failed.",
          );
        }

        setSuccess("Account created successfully. Please sign in.");

        setMode("login");

        setForm((current) => ({
          ...current,
          password: "",
          confirmPassword: "",
        }));

        return;
      }

      if (mode === "forgot") {
        setError("Password reset is not available yet.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D0D0E] text-white relative overflow-hidden p-12 flex-col justify-between">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[9px] bg-[#3D3BF3] flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>

            <span className="font-bold text-lg">Walleto</span>
          </div>
        </div>

        <div className="relative max-w-lg">
          <h2 className="text-5xl font-bold tracking-tight leading-tight">
            Banking built for
            <span className="text-[#3D3BF3]"> the next decade.</span>
          </h2>

          <p className="mt-6 text-gray-400 text-lg leading-relaxed">
            A financial operating system designed for how intelligent businesses
            move money.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-8 max-w-lg">
          {[
            {
              label: "Total users",
              value: "12,840",
            },
            {
              label: "Transaction volume",
              value: "$4.2B",
            },
            {
              label: "Uptime",
              value: "99.99%",
            },
            {
              label: "Countries",
              value: "24",
            },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-gray-500 text-xs mb-1">{stat.label}</p>

              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-96">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#3D3BF3] flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>

            <span className="font-bold text-[#0D0D0E] text-base">Walleto</span>
          </div>

          {error && (
            <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-[10px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {mode === "login" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#0D0D0E] mb-1">
                  Sign in
                </h1>

                <p className="text-sm text-[#9CA3AF]">
                  Access your Walleto account
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />

                <PasswordInput
                  label="Password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setMode("forgot");
                    }}
                    className="text-xs text-[#3D3BF3] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" fullWidth loading={loading}>
                  Sign in
                </Button>
              </form>

              <p className="text-sm text-[#9CA3AF] text-center mt-6">
                No account?{" "}
                <button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setMode("register");
                  }}
                  className="text-[#3D3BF3] font-medium hover:underline cursor-pointer"
                >
                  Create one
                </button>
              </p>
            </>
          )}

          {mode === "register" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#0D0D0E] mb-1">
                  Create account
                </h1>

                <p className="text-sm text-[#9CA3AF]">
                  Get started with Walleto
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First name"
                    placeholder="Clement"
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    required
                  />

                  <Input
                    label="Last name"
                    placeholder="Eneh"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />

                <Input
                  label="Phone"
                  type="tel"
                  placeholder="08031234567"
                  value={form.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  required
                />

                <PasswordInput
                  label="Password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />

                <PasswordInput
                  label="Confirm password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  required
                />

                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 accent-[#3D3BF3]"
                  />

                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    I agree to the{" "}
                    <a href="#" className="text-[#3D3BF3] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#3D3BF3] hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>

                <Button type="submit" fullWidth loading={loading}>
                  Create account
                </Button>
              </form>

              <p className="text-sm text-[#9CA3AF] text-center mt-6">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setMode("login");
                  }}
                  className="text-[#3D3BF3] font-medium hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#0D0D0E] mb-1">
                  Reset password
                </h1>

                <p className="text-sm text-[#9CA3AF]">
                  Password reset will be available soon.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
                className="text-sm text-[#3D3BF3] font-medium hover:underline cursor-pointer"
              >
                ← Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
