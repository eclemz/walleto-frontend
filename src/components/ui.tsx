import { type ReactNode, type InputHTMLAttributes, type ButtonHTMLAttributes, useState } from 'react';

// ── Buttons ──────────────────────────────────────────────────────────────────

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({ children, variant = 'primary', size = 'md', loading, fullWidth, className = '', disabled, ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 rounded-[10px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-9 px-4 text-sm', lg: 'h-11 px-6 text-base' };
  const variants = {
    primary: 'bg-[#3D3BF3] text-white hover:bg-[#3330d4] active:bg-[#2e2cbf] shadow-sm',
    secondary: 'bg-white text-[#0D0D0E] border border-[#E5E7EB] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] shadow-sm',
    ghost: 'text-[#374151] hover:bg-[#F3F4F6] active:bg-[#E5E7EB]',
    destructive: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B] shadow-sm',
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ── Inputs ────────────────────────────────────────────────────────────────────

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function Input({ label, error, hint, prefix, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#374151]">{label}</label>}
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-[#9CA3AF] text-sm">{prefix}</span>}
        <input
          className={`w-full h-9 px-3 text-sm bg-white border border-[#E5E7EB] rounded-[10px] text-[#0D0D0E] placeholder-[#9CA3AF] outline-none transition-all duration-150 focus:border-[#3D3BF3] focus:ring-2 focus:ring-[#3D3BF3]/10 ${error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10' : ''} ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''} ${className}`}
          {...props}
        />
        {suffix && <span className="absolute right-3 text-[#9CA3AF] text-sm">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#9CA3AF]">{hint}</p>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const variants = {
    success: 'bg-[#DCFCE7] text-[#16A34A]',
    warning: 'bg-[#FEF3C7] text-[#D97706]',
    error: 'bg-[#FEE2E2] text-[#DC2626]',
    info: 'bg-[#E0F2FE] text-[#0EA5E9]',
    neutral: 'bg-[#F3F4F6] text-[#374151]',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

export function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} rounded-full bg-[#3D3BF3]/10 text-[#3D3BF3] font-semibold flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-[12px] ${className}`}>
      {children}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-[#3D3BF3]' : 'bg-[#D1D5DB]'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
    </button>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 p-1 bg-[#F3F4F6] rounded-[10px] w-fit">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-3 h-7 text-sm font-medium rounded-[8px] transition-all duration-150 ${active === tab ? 'bg-white text-[#0D0D0E] shadow-sm' : 'text-[#6B7280] hover:text-[#374151]'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────

export function Select({ label, options, value, onChange }: { label?: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#374151]">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 px-3 text-sm bg-white border border-[#E5E7EB] rounded-[10px] text-[#0D0D0E] outline-none focus:border-[#3D3BF3] focus:ring-2 focus:ring-[#3D3BF3]/10 cursor-pointer"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-[#F3F4F6] rounded animate-pulse ${className}`} />;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

export function StatCard({ label, value, change, icon, accent }: { label: string; value: string; change?: string; icon: string; accent?: boolean }) {
  const positive = change?.startsWith('+');
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">{label}</span>
        <span className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-base ${accent ? 'bg-[#3D3BF3]/10 text-[#3D3BF3]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-[#0D0D0E] tracking-tight mb-1">{value}</p>
      {change && (
        <p className={`text-xs font-medium ${positive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{change} this month</p>
      )}
    </Card>
  );
}

// ── Password input ────────────────────────────────────────────────────────────

export function PasswordInput({ label, error, prefix: _p, suffix: _s, ...props }: InputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#374151]">{label}</label>}
      <div className="relative flex items-center">
        <input
          type={show ? 'text' : 'password'}
          className={`w-full h-9 px-3 pr-10 text-sm bg-white border border-[#E5E7EB] rounded-[10px] text-[#0D0D0E] placeholder-[#9CA3AF] outline-none transition-all duration-150 focus:border-[#3D3BF3] focus:ring-2 focus:ring-[#3D3BF3]/10 ${error ? 'border-[#DC2626]' : ''}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 text-[#9CA3AF] hover:text-[#6B7280] text-xs"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}
