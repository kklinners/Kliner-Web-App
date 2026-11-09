"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Inbox,
  CalendarDays,
  History,
  Wallet,
  Building2,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Circle,
  RefreshCw,
} from "lucide-react";
import { httpClient } from "../../../utils/httpClient";
import { isAuthenticated } from "../../../utils/tokenService";
import { SERVICE_TYPE_LABELS, COMMISSION_RATE } from "../../../utils/serviceAreas";
import {
  Shell,
  Panel,
  Stat,
  Empty,
  Notice,
  DataTable,
  KV,
  Button,
  Pill,
  StatusPill,
  JOB_STATUS,
  PARTNER_STATUS,
  PAYOUT_STATUS,
  money,
  shortDate,
  longDate,
  apiError,
  mono,
  currentUser,
  logout,
} from "../../components/dash/ui";

const DECLINE_REASONS = ["Fully booked that day", "Too far from our base", "Job too large for our team", "Other"];

/* ---------------- job card ---------------- */

function DateBlock({ date }) {
  const d = date ? new Date(date) : null;
  return (
    <div className="w-14 shrink-0 rounded-lg border border-stone-200 text-center overflow-hidden self-start">
      <p className="bg-stone-900 text-white text-[11px] font-semibold uppercase tracking-wider py-0.5">
        {d ? d.toLocaleDateString("en-NG", { month: "short" }) : "—"}
      </p>
      <p className="text-[22px] font-bold leading-8 tabular-nums">{d ? d.getDate() : "—"}</p>
      <p className="text-[11px] text-stone-500 pb-1">{d ? d.toLocaleDateString("en-NG", { weekday: "short" }) : ""}</p>
    </div>
  );
}

const roomsSummary = (job) => {
  const rooms = job.serviceDetails?.cleaningDetails?.rooms || {};
  const list = Object.entries(rooms).filter(([, n]) => Number(n) > 0);
  return list.length ? list.map(([r, n]) => `${r} × ${n}`).join(" · ") : null;
};

function JobCard({ job, busy, onAction }) {
  const [mode, setMode] = useState(null); // "decline" | "complete" | null
  const [reason, setReason] = useState(DECLINE_REASONS[0]);
  const details = job.serviceDetails?.cleaningDetails;
  const rooms = roomsSummary(job);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5">
      <div className="flex gap-4">
        <DateBlock date={job.bookingDate} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-stone-900">{job.serviceCategory}</p>
              <p className="text-[13px] text-stone-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Clock size={13} />
                  {job.bookingTime}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} />
                  {job.area}
                </span>
              </p>
            </div>
            <StatusPill map={JOB_STATUS} value={job.status} />
          </div>

          {(details || rooms) && (
            <p className="mt-2 text-[13px] text-stone-600">
              {[details?.package, details?.homeSize && `${details.homeSize} home`, rooms].filter(Boolean).join(" · ")}
            </p>
          )}

          {["accepted", "in_progress"].includes(job.status) && (
            <div className="mt-3 rounded-lg bg-stone-50 px-3 py-2.5 text-[14px] space-y-1">
              <p className="text-stone-900 font-medium">{job.customer?.name}</p>
              <p className="text-stone-600">{job.location}</p>
              {job.customer?.phone && (
                <a href={`tel:${job.customer.phone}`} className="inline-flex items-center gap-1.5 text-brand-700 font-semibold">
                  <Phone size={14} /> {job.customer.phone}
                </a>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
            <div>
              <p className="text-[12px] text-stone-500">{job.status === "completed" ? "You earned" : "You'll earn"}</p>
              <p className="text-[18px] font-bold tabular-nums text-stone-900">{money(job.estimatedPayout)}</p>
            </div>

            {job.status === "assigned" && !mode && (
              <div className="flex gap-2">
                <Button variant="outline" disabled={busy} onClick={() => setMode("decline")}>
                  Decline
                </Button>
                <Button disabled={busy} onClick={() => onAction(job.id, "accept")}>
                  Accept job
                </Button>
              </div>
            )}
            {job.status === "accepted" && (
              <Button variant="dark" disabled={busy} onClick={() => onAction(job.id, "start")}>
                Team has arrived — start
              </Button>
            )}
            {job.status === "in_progress" && !mode && (
              <Button variant="success" disabled={busy} onClick={() => setMode("complete")}>
                Mark as completed
              </Button>
            )}
            {job.status === "completed" && <StatusPill map={PAYOUT_STATUS} value={job.payout?.status} />}
          </div>

          {mode === "decline" && (
            <div className="mt-3 rounded-lg ring-1 ring-stone-200 p-3 space-y-3">
              <p className="text-[14px] font-medium">Why are you declining?</p>
              <div className="flex flex-wrap gap-2">
                {DECLINE_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`px-3 h-8 rounded-full text-[13px] font-medium ring-1 ring-inset ${
                      reason === r ? "bg-stone-900 text-white ring-stone-900" : "bg-white text-stone-700 ring-stone-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" disabled={busy} onClick={() => onAction(job.id, "decline", { reason })}>
                  Decline job
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
                  Keep it
                </Button>
              </div>
            </div>
          )}
          {mode === "complete" && (
            <div className="mt-3 rounded-lg ring-1 ring-emerald-200 bg-emerald-50/50 p-3 space-y-2">
              <p className="text-[14px] text-stone-800">Confirm every room is done and the customer is satisfied.</p>
              <div className="flex gap-2">
                <Button variant="success" size="sm" disabled={busy} onClick={() => onAction(job.id, "complete")}>
                  Yes, job is complete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
                  Not yet
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- not-verified states ---------------- */

function StatusScreen({ profile, onRefresh, router }) {
  const checks = profile?.verificationChecks || {};
  const steps: [label: string, done: boolean, hint: string][] = [
    ["Application received", true, "We have your details."],
    ["Guarantor & client calls", Boolean(checks.guarantorCalled), "We'll phone your guarantor and past clients."],
    ["Office visit & ID check", Boolean(checks.officeVisited && checks.idSeen), "We'll visit your base and see the owner's ID."],
    ["Approved", false, "You start receiving jobs in your areas."],
  ];

  let content;
  if (!profile) {
    content = (
      <>
        <h1 className="text-[22px] font-bold tracking-tight">You haven&apos;t applied yet</h1>
        <p className="text-stone-600 mt-1 mb-6">List your cleaning company on Kliner and get jobs in Gbagada.</p>
        <Button size="lg" onClick={() => router.push("/partners/apply")}>
          Start application
        </Button>
      </>
    );
  } else if (profile.status === "pending") {
    content = (
      <>
        <Pill tone="amber">Awaiting verification</Pill>
        <h1 className="text-[22px] font-bold tracking-tight mt-3">{profile.companyName}</h1>
        <p className="text-stone-600 mt-1 mb-6">
          We&apos;ll contact you on <b>{profile.phone}</b> to arrange the visit.
        </p>
        <ol className="space-y-4 mb-6">
          {steps.map(([label, done, hint]) => (
            <li key={label} className="flex gap-3">
              {done ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" /> : <Circle size={20} className="text-stone-300 shrink-0 mt-0.5" />}
              <div>
                <p className={`text-[15px] ${done ? "font-semibold text-stone-900" : "text-stone-700"}`}>{label}</p>
                <p className="text-[13px] text-stone-500">{hint}</p>
              </div>
            </li>
          ))}
        </ol>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw size={15} /> Refresh status
        </Button>
      </>
    );
  } else {
    content = (
      <>
        <StatusPill map={PARTNER_STATUS} value={profile.status} />
        <h1 className="text-[22px] font-bold tracking-tight mt-3">{profile.companyName}</h1>
        <p className="text-stone-600 mt-1 mb-6">
          {profile.status === "rejected" ? "Your application wasn't approved." : "Your partner account is suspended."}
          {profile.statusNote && (
            <>
              <br />
              <span className="text-stone-900">Reason: {profile.statusNote}</span>
            </>
          )}
        </p>
        {profile.status === "rejected" && <Button onClick={() => router.push("/partners/apply")}>Update application</Button>}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-stone-900">
      <header className="h-16 flex items-center gap-2.5 px-5 sm:px-8 border-b border-stone-200 bg-white">
        <Image src="/klin-logo.png" alt="Kliner" width={28} height={28} className="rounded-md" />
        <span className="font-bold tracking-tight">Kliner</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Vendor</span>
        <button onClick={logout} className="ml-auto text-[14px] text-stone-500 hover:text-stone-900">
          Log out
        </button>
      </header>
      <div className="max-w-lg mx-auto px-5 py-12">{content}</div>
    </div>
  );
}

/* ---------------- page ---------------- */

export default function PartnerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(undefined); // undefined = loading, null = none
  const [data, setData] = useState(null);
  const [section, setSection] = useState("requests");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [user, setUser] = useState({ name: "", email: "" });

  const load = useCallback(async () => {
    if (!isAuthenticated()) {
      router.replace("/partners");
      return;
    }
    try {
      const me = await httpClient.get("/api/v1/partners/me");
      setProfile(me.data.data);
      if (me.data.data?.status === "verified") {
        const res = await httpClient.get("/api/v1/partners/me/jobs");
        setData(res.data.data);
      }
    } catch (err) {
      setError(apiError(err));
      setProfile(null);
    }
  }, [router]);

  useEffect(() => {
    setUser(currentUser());
    load();
  }, [load]);

  const handleAction = async (id, action, body = {}) => {
    setBusy(true);
    setError("");
    try {
      await httpClient.post(`/api/v1/partners/jobs/${id}/${action}`, body);
      const messages = {
        accept: "Job accepted. The customer's address and phone are now in your schedule.",
        decline: "Job declined. We'll offer it to another partner.",
        start: "Job started.",
        complete: "Great work! Your payout is now due.",
      };
      await load();
      setFlash(messages[action]);
      if (action === "accept") setSection("schedule");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (profile === undefined) {
    return <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center text-stone-500 text-[14px]">Loading…</div>;
  }
  if (!profile || profile.status !== "verified") {
    return <StatusScreen profile={profile} onRefresh={load} router={router} />;
  }

  const jobs = data?.jobs || [];
  const requests = jobs.filter((j) => j.status === "assigned");
  const schedule = jobs.filter((j) => ["accepted", "in_progress"].includes(j.status));
  const history = jobs.filter((j) => ["completed", "cancelled"].includes(j.status)).reverse();
  const rate = profile.commissionRate ?? COMMISSION_RATE;

  const nav = [
    { id: "requests", label: "Requests", icon: Inbox, count: requests.length },
    { id: "schedule", label: "Schedule", icon: CalendarDays, count: schedule.length },
    { id: "history", label: "History", icon: History },
    { id: "earnings", label: "Earnings", short: "Money", icon: Wallet },
    { id: "profile", label: "Business", icon: Building2 },
  ];
  const titles = {
    requests: ["Job requests", "New jobs offered to you. Accept to see the customer's details."],
    schedule: ["Schedule", "Jobs you've accepted, in date order."],
    history: ["History", "Completed jobs."],
    earnings: ["Earnings", `You keep ${Math.round((1 - rate) * 100)}% of every job. Kliner's fee is ${Math.round(rate * 100)}%.`],
    profile: [profile.companyName, "Your business details on Kliner."],
  };

  const cards = (list, emptyIcon, emptyTitle, emptyText) =>
    list.length ? (
      <div className="space-y-3">
        {list.map((j) => (
          <JobCard key={j.id} job={j} busy={busy} onAction={handleAction} />
        ))}
      </div>
    ) : (
      <Panel>
        <Empty icon={emptyIcon} title={emptyTitle} text={emptyText} />
      </Panel>
    );

  return (
    <Shell
      title={titles[section][0]}
      subtitle={titles[section][1]}
      nav={nav}
      active={section}
      onNavigate={(s) => {
        setSection(s);
        setFlash("");
      }}
      user={user}
      onLogout={logout}
      badge="Vendor"
    >
      {error && <Notice onClose={() => setError("")}>{error}</Notice>}
      {flash && (
        <Notice tone="green" onClose={() => setFlash("")}>
          {flash}
        </Notice>
      )}

      {["requests", "schedule"].includes(section) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Stat label="New requests" value={requests.length} tone={requests.length ? "brand" : "default"} />
          <Stat label="Upcoming" value={schedule.length} hint={schedule[0] ? `Next: ${shortDate(schedule[0].bookingDate)}` : "Nothing booked"} />
          <Stat label="Payout due" value={money(data?.earnings?.pending)} tone={data?.earnings?.pending ? "amber" : "default"} />
          <Stat label="Paid to you" value={money(data?.earnings?.paid)} hint={`${profile.stats?.jobsCompleted || 0} job${profile.stats?.jobsCompleted === 1 ? "" : "s"} done`} />
        </div>
      )}

      {section === "requests" && cards(requests, Inbox, "No new requests", "When Kliner offers you a job in your areas, it appears here.")}
      {section === "schedule" && cards(schedule, CalendarDays, "Nothing scheduled", "Accepted jobs show here with the customer's address and phone.")}
      {section === "history" && cards(history, History, "No completed jobs yet", "Finished jobs and their payout status show here.")}

      {section === "earnings" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label="Payout due" value={money(data?.earnings?.pending)} tone={data?.earnings?.pending ? "amber" : "default"} hint="Sent to your bank by Kliner" />
            <Stat label="Paid to you" value={money(data?.earnings?.paid)} hint="All time" />
            <Stat label="Jobs completed" value={profile.stats?.jobsCompleted || 0} />
          </div>
          <DataTable
            columns={[
              {
                key: "job",
                label: "Job",
                render: (j) => (
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{j.serviceCategory}</p>
                    <p className="text-[13px] text-stone-500">
                      {shortDate(j.completedAt)} · {j.area}
                    </p>
                  </div>
                ),
              },
              { key: "value", label: "Job value", align: "right", hideOnMobile: true, render: (j) => money(j.amount) },
              { key: "fee", label: "Kliner fee", align: "right", hideOnMobile: true, render: (j) => <span className="text-stone-500">−{money(j.payout?.commissionAmount)}</span> },
              { key: "earned", label: "You earn", align: "right", mobileRight: true, render: (j) => <span className="font-semibold">{money(j.payout?.partnerAmount)}</span> },
              { key: "status", label: "Payout", render: (j) => <StatusPill map={PAYOUT_STATUS} value={j.payout?.status} /> },
              { key: "ref", label: "Transfer ref", hideOnMobile: true, render: (j) => <span className={`${mono} text-stone-500`}>{j.payout?.transferReference || "—"}</span> },
            ]}
            rows={history.filter((j) => j.status === "completed")}
            empty={
              <Panel>
                <Empty icon={Wallet} title="No earnings yet" text="Complete your first job to see earnings here." />
              </Panel>
            }
          />
        </div>
      )}

      {section === "profile" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Panel title="Business">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill map={PARTNER_STATUS} value={profile.status} />
                {profile.isRegisteredBusiness && (
                  <Pill tone="brand" dot={false}>
                    CAC registered
                  </Pill>
                )}
                <span className="text-[13px] text-stone-500">Since {longDate(profile.verifiedAt)}</span>
              </div>
              <KV
                rows={[
                  ["Owner", profile.owner?.fullName],
                  ["Contact", `${profile.contactName} · ${profile.phone}`],
                  ["Office / base", profile.officeAddress],
                  ["Team size", `${profile.teamSize} people`],
                  ["Services", profile.services.map((s) => SERVICE_TYPE_LABELS[s] || s).join(", ")],
                ]}
              />
            </div>
          </Panel>
          <div className="space-y-6">
            <Panel title="Areas you cover">
              <div className="flex flex-wrap gap-1.5">
                {profile.areas.map((a) => (
                  <Pill key={a} dot={false}>
                    {a}
                  </Pill>
                ))}
              </div>
            </Panel>
            <Panel title="Payout account">
              <KV
                rows={[
                  ["Bank", profile.bank?.bankName],
                  ["Account", profile.bank?.accountNumber && <span key="a" className={mono}>••••{profile.bank.accountNumber.slice(-4)}</span>],
                  ["Name", profile.bank?.accountName],
                ]}
              />
              <p className="text-[13px] text-stone-500 mt-3">To change your areas or bank details, contact Kliner support.</p>
            </Panel>
          </div>
        </div>
      )}

      {busy && <div className="fixed top-0 inset-x-0 h-0.5 bg-brand-600 animate-pulse z-50" />}
    </Shell>
  );
}
