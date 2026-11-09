"use client";
// Shared building blocks for the admin and vendor dashboards.
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, LogOut } from "lucide-react";
import { formatNaira } from "../../../utils/pricing";
import { VENDORS_ENABLED } from "../../../utils/features";

/* ---------------- formatting ---------------- */

export const money = (n) => formatNaira(n || 0);

export const shortDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "—";

export const longDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "—";

export const dateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "—";

export const timeAgo = (d) => {
  if (!d) return "—";
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return shortDate(d);
};

export const apiError = (err) =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || "Something went wrong";

/* ---------------- status ---------------- */

const TONES = {
  neutral: "bg-stone-100 text-stone-700 ring-stone-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
};

export const JOB_STATUS = {
  pending: ["Awaiting payment", "neutral"],
  confirmed: [VENDORS_ENABLED ? "Needs partner" : "Needs team", "amber"],
  assigned: ["Offered", "sky"],
  accepted: [VENDORS_ENABLED ? "Accepted" : "Team assigned", "brand"],
  in_progress: ["In progress", "brand"],
  completed: ["Completed", "green"],
  cancelled: ["Cancelled", "red"],
};

export const PARTNER_STATUS = {
  pending: ["Pending review", "amber"],
  verified: ["Verified", "green"],
  rejected: ["Rejected", "red"],
  suspended: ["Suspended", "neutral"],
};

export const PAYOUT_STATUS = {
  not_due: ["Not due", "neutral"],
  pending: ["Payout due", "amber"],
  paid: ["Paid out", "green"],
};

export function Pill({ tone = "neutral", children, dot = true }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium ring-1 ring-inset whitespace-nowrap ${TONES[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export function StatusPill({ map, value }) {
  const [label, tone] = map[value] || [value || "—", "neutral"];
  return <Pill tone={tone}>{label}</Pill>;
}

/* ---------------- layout ---------------- */

export function Shell({ title, subtitle = "", nav, active, onNavigate, user, onLogout, children, badge = null }) {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-stone-900">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-stone-200 bg-white">
        <Link href="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-stone-100">
          <Image src="/klin-logo.png" alt="Kliner" width={28} height={28} className="rounded-md" />
          <span className="font-bold tracking-tight text-[15px]">Kliner</span>
          {badge && <span className="ml-auto text-[11px] font-semibold uppercase tracking-wider text-stone-500">{badge}</span>}
        </Link>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ id, label, icon: Icon, count }) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors ${
                  isActive ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.25 : 1.75} />
                {label}
                {count ? (
                  <span
                    className={`ml-auto min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center tabular-nums ${
                      isActive ? "bg-white/20 text-white" : "bg-brand-600 text-white"
                    }`}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-stone-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[13px] font-semibold">
              {(user?.name || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold truncate">{user?.name}</p>
              <p className="text-[12px] text-stone-500 truncate">{user?.email}</p>
            </div>
            <button onClick={onLogout} title="Log out" className="p-1.5 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-100">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="lg:hidden sticky top-0 z-20 flex items-center gap-2.5 h-14 px-4 bg-white/90 backdrop-blur border-b border-stone-200">
        <Image src="/klin-logo.png" alt="Kliner" width={26} height={26} className="rounded-md" />
        <span className="font-bold tracking-tight">Kliner</span>
        {badge && <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">{badge}</span>}
        <button onClick={onLogout} className="ml-auto p-2 rounded-md text-stone-500" title="Log out">
          <LogOut size={18} />
        </button>
      </header>

      <main className="lg:pl-60 pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-[22px] lg:text-[26px] font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-stone-500 text-[14px] mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>

      {/* Bottom tabs (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-stone-200 grid" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
        {nav.map(({ id, short, label, icon: Icon, count }) => {
          const isActive = id === active;
          return (
            <button key={id} onClick={() => onNavigate(id)} className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? "text-brand-700" : "text-stone-500"}`}>
              <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
              {short || label}
              {count ? (
                <span className="absolute top-1 left-1/2 ml-2 min-w-4 h-4 px-1 rounded-full bg-brand-600 text-white text-[10px] font-semibold flex items-center justify-center">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ---------------- surfaces ---------------- */

export function Panel({ title = null, action = null, children, className = "", padded = true }) {
  return (
    <section className={`bg-white rounded-xl border border-stone-200 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          {title && <h2 className="text-[14px] font-semibold text-stone-900">{title}</h2>}
          {action}
        </div>
      )}
      <div className={padded ? "px-5 pb-5" : ""}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint = null, tone = "default", icon: Icon = null }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 px-5 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium uppercase tracking-wider text-stone-500">{label}</p>
        {Icon && <Icon size={16} className="text-stone-400" />}
      </div>
      <p className={`mt-2 text-[24px] font-bold tracking-tight tabular-nums ${tone === "brand" ? "text-brand-700" : tone === "amber" ? "text-amber-700" : "text-stone-900"}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[12px] text-stone-500">{hint}</p>}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-stone-200 mb-4 overflow-x-auto">
      {tabs.map(([id, label, count]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`relative px-3 py-2.5 text-[14px] font-medium whitespace-nowrap transition-colors ${
            active === id ? "text-stone-900" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          {label}
          {count != null && <span className="ml-1.5 text-stone-400 tabular-nums">{count}</span>}
          {active === id && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-stone-900 rounded-full" />}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon: Icon, title, text = "" }) {
  return (
    <div className="text-center py-14 px-6">
      {Icon && (
        <div className="mx-auto mb-3 h-11 w-11 rounded-full bg-stone-100 flex items-center justify-center">
          <Icon size={20} className="text-stone-500" />
        </div>
      )}
      <p className="font-semibold text-stone-900">{title}</p>
      {text && <p className="text-[14px] text-stone-500 mt-1 max-w-sm mx-auto">{text}</p>}
    </div>
  );
}

export function Notice({ tone = "red", children, onClose = null }) {
  const tones = {
    red: "bg-rose-50 border-rose-200 text-rose-800",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };
  return (
    <div className={`flex items-start gap-3 border rounded-lg px-4 py-3 text-[14px] mb-4 ${tones[tone]}`}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

/* ---------------- tables ---------------- */

// Rows render as a table on desktop and as stacked cards on phones.
export function DataTable({ columns, rows, onRowClick = null, rowKey = (r) => r.id || r._id, empty = null }) {
  if (!rows.length) return empty;
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <table className="hidden md:table w-full text-[14px]">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50/60">
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-wider text-stone-500 ${c.align === "right" ? "text-right" : ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((r) => (
            <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={onRowClick ? "cursor-pointer hover:bg-stone-50" : ""}>
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-middle ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="md:hidden divide-y divide-stone-100">
        {rows.map((r) => (
          <li key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={`px-4 py-3 ${onRowClick ? "active:bg-stone-50" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">{columns[0].render(r)}</div>
              {columns.find((c) => c.mobileRight)?.render(r)}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-stone-500">
              {columns
                .filter((c, i) => i > 0 && !c.mobileRight && !c.hideOnMobile)
                .map((c) => (
                  <span key={c.key}>{c.render(r)}</span>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- drawer ---------------- */

export function Drawer({ open, onClose, title, subtitle = null, children, footer = null }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-stone-900/30" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="absolute inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-start gap-3 px-6 py-5 border-b border-stone-200">
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-bold tracking-tight truncate">{title}</h2>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="p-1.5 -mr-1.5 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">{children}</div>
        {footer && <div className="border-t border-stone-200 px-6 py-4 bg-stone-50/60">{footer}</div>}
      </div>
    </div>
  );
}

export function Section({ title, children, aside = null }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-stone-500">{title}</h3>
        {aside}
      </div>
      {children}
    </div>
  );
}

export function KV({ rows }) {
  return (
    <dl className="rounded-lg border border-stone-200 divide-y divide-stone-100">
      {rows
        .filter(Boolean)
        .map(([k, v]) => (
          <div key={k} className="flex gap-4 px-3.5 py-2.5 text-[14px]">
            <dt className="w-36 shrink-0 text-stone-500">{k}</dt>
            <dd className="min-w-0 flex-1 text-stone-900 break-words">{v || "—"}</dd>
          </div>
        ))}
    </dl>
  );
}

export function Timeline({ steps }) {
  return (
    <ol className="relative ml-1.5">
      {steps.map(([label, at, note], i) => {
        const done = Boolean(at);
        const last = i === steps.length - 1;
        return (
          <li key={label} className="relative pl-6 pb-4 last:pb-0">
            {!last && <span className={`absolute left-[5px] top-3 bottom-0 w-px ${done ? "bg-stone-300" : "bg-stone-200 border-l border-dashed border-stone-300"}`} />}
            <span className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full ring-2 ring-white ${done ? "bg-brand-600" : "bg-stone-200"}`} />
            <div className="flex items-baseline justify-between gap-3">
              <p className={`text-[14px] ${done ? "font-medium text-stone-900" : "text-stone-400"}`}>{label}</p>
              <p className="text-[12px] text-stone-500 tabular-nums">{done ? dateTime(at) : ""}</p>
            </div>
            {note && <p className="text-[13px] text-stone-500">{note}</p>}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- controls ---------------- */

export function Button({ variant = "primary", size = "md", className = "", children, ...props }) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-stone-200 disabled:text-stone-400",
    dark: "bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400",
    outline: "bg-white text-stone-800 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 disabled:text-stone-400",
    danger: "bg-white text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50",
    ghost: "text-stone-600 hover:bg-stone-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400",
  };
  const sizes = { sm: "h-8 px-3 text-[13px]", md: "h-10 px-4 text-[14px]", lg: "h-11 px-5 text-[15px]" };
  return (
    <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full sm:w-64 rounded-lg bg-white px-3 text-[14px] text-stone-900 ring-1 ring-inset ring-stone-300 !border-0 !shadow-none focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-stone-400"
    />
  );
}

export const mono = "tabular-nums text-[12.5px]";

/* ---------------- session ---------------- */

export const currentUser = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user_data") || "{}");
    return {
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "Account",
      email: u.email || "",
    };
  } catch {
    return { name: "Account", email: "" };
  }
};

export const logout = () => {
  document.cookie = "auth_token=; max-age=0; path=/";
  try {
    localStorage.removeItem("user_data");
  } catch {}
  window.location.href = "/auth/signin";
};
