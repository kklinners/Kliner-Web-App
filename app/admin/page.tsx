"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  FileCheck2,
  Building2,
  Briefcase,
  Wallet,
  ShieldAlert,
  Inbox,
  CheckCircle2,
  Circle,
  ArrowRight,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";
import { httpClient } from "../../utils/httpClient";
import { isAuthenticated } from "../../utils/tokenService";
import { setPostAuthRedirect } from "../../utils/postAuthRedirect";
import { SERVICE_TYPE_LABELS, LAUNCH_DISTRICT } from "../../utils/serviceAreas";
import { VENDORS_ENABLED } from "../../utils/features";
import { teamJobWhatsAppMessage, teamWhatsAppLink, fieldJobUrl } from "../../utils/teamField";
import PromotionsSection from "./PromotionsSection";
import EmployeesSection from "./EmployeesSection";
import JobProgress from "../components/JobProgress";
import { formatDuration } from "../../utils/jobProgress";
import {
  Shell,
  Panel,
  Stat,
  Tabs,
  Empty,
  Notice,
  DataTable,
  Drawer,
  Section,
  KV,
  Timeline,
  Button,
  SearchInput,
  Pill,
  StatusPill,
  JOB_STATUS,
  PARTNER_STATUS,
  PAYOUT_STATUS,
  money,
  shortDate,
  longDate,
  timeAgo,
  apiError,
  mono,
  currentUser,
  logout,
} from "../components/dash/ui";

const ID_LABELS = {
  nin: "NIN slip / National ID",
  voters_card: "Voter's card",
  drivers_licence: "Driver's licence",
  intl_passport: "International passport",
};

// Must match REQUIRED_VERIFICATION_CHECKS in kklinners-backend/config/marketplace.js
const CHECKS: [key: string, label: string, hint: string, required: boolean][] = [
  ["idSeen", "Owner's ID seen in person", "Name on ID matches the owner on the application", true],
  ["bankNameMatches", "Payout account name matches", "Account is in the owner's or business's name", true],
  ["guarantorCalled", "Guarantor called", "They know the owner and vouch for the business", true],
  ["officeVisited", "Office or base visited", "Address exists and equipment/team seen", true],
  ["referencesCalled", "Past clients called", "Recommended — confirms quality of work", false],
  ["cacChecked", "CAC number checked", "Only for registered businesses", false],
];

const serviceLabel = (t) => SERVICE_TYPE_LABELS[t] || t;

/* ======================================================================= */

export default function AdminPage() {
  const router = useRouter();
  const [section, setSection] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [partners, setPartners] = useState([]);
  const [jobs, setJobs] = useState({ unassigned: [], active: [], completed: [], payouts: [] });
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [openPartnerId, setOpenPartnerId] = useState(null);
  const [openJobId, setOpenJobId] = useState(null);
  const [user, setUser] = useState({ name: "", email: "" });
  const [employees, setEmployees] = useState([]);

  const load = useCallback(async () => {
    try {
      const none = Promise.resolve({ data: { data: [] } });
      const [o, p, u, a, c, pay, em] = await Promise.all([
        httpClient.get("/api/v1/partners/admin/overview"),
        VENDORS_ENABLED ? httpClient.get("/api/v1/partners") : none,
        httpClient.get("/api/v1/partners/admin/jobs?view=unassigned"),
        httpClient.get("/api/v1/partners/admin/jobs?view=active"),
        httpClient.get("/api/v1/partners/admin/jobs?view=completed"),
        VENDORS_ENABLED ? httpClient.get("/api/v1/partners/admin/jobs?view=payouts") : none,
        httpClient.get("/api/v1/employees").catch(() => ({ data: { data: [] } })),
      ]);
      setOverview(o.data.data);
      setPartners(p.data.data || []);
      setJobs({ unassigned: u.data.data, active: a.data.data, completed: c.data.data, payouts: pay.data.data });
      setEmployees(em.data.data || []);
      setError("");
    } catch (err) {
      const msg = apiError(err);
      if (/admin/i.test(msg)) setDenied(true);
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      setPostAuthRedirect("/admin");
      router.replace("/auth/signin");
      return;
    }
    setUser(currentUser());
    load();
  }, [load, router]);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
      return true;
    } catch (err) {
      setError(apiError(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const pending = partners.filter((p) => p.status === "pending");
  const allJobs = useMemo(() => [...jobs.unassigned, ...jobs.active, ...jobs.completed, ...jobs.payouts], [jobs]);
  const openPartner = partners.find((p) => p._id === openPartnerId);
  const openJob = allJobs.find((j) => String(j.id) === String(openJobId)) || overview?.recent?.find((j) => String(j.id) === String(openJobId));

  const nav = [
    { id: "overview", label: "Overview", short: "Home", icon: LayoutGrid },
    VENDORS_ENABLED && { id: "applications", label: "Applications", short: "Apply", icon: FileCheck2, count: pending.length },
    VENDORS_ENABLED && { id: "partners", label: "Partners", icon: Building2 },
    { id: "jobs", label: "Jobs", icon: Briefcase, count: jobs.unassigned.length },
    { id: "promotions", label: "Promotions", short: "Offers", icon: Megaphone },
    { id: "employees", label: "Employees", short: "Staff", icon: Users },
    VENDORS_ENABLED && { id: "payouts", label: "Payouts", short: "Pay", icon: Wallet, count: jobs.payouts.length },
  ].filter(Boolean);

  const titles = {
    overview: ["Overview", `Business activity in ${LAUNCH_DISTRICT}`],
    applications: ["Applications", "Review and verify new partner companies"],
    partners: ["Partners", "Companies fulfilling Kliner bookings"],
    jobs: ["Jobs", "Paid bookings and the teams handling them"],
    promotions: ["Promotions", "Banners on customers' home screen"],
    employees: ["Employees", "Roster, BVN, IDs, and photos for field teams"],
    payouts: ["Payouts", "Money owed to partners for completed jobs"],
  };

  if (denied) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-6">
        <Panel className="max-w-md w-full">
          <div className="pt-5">
            <Empty icon={ShieldAlert} title="Admins only" text="This account doesn't have admin access. Log in with an admin account to continue." />
            <Button className="w-full" onClick={logout}>Switch account</Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <Shell
      title={titles[section][0]}
      subtitle={titles[section][1]}
      nav={nav}
      active={section}
      onNavigate={setSection}
      user={user}
      onLogout={logout}
      badge="Admin"
    >
      {error && <Notice onClose={() => setError("")}>{error}</Notice>}

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          {section === "overview" && overview && (
            <Overview data={overview} pending={pending} jobs={jobs} go={setSection} openJob={setOpenJobId} />
          )}
          {section === "applications" && (
            <PartnersTable rows={pending} onOpen={setOpenPartnerId} emptyText="No applications waiting for review." isApplications />
          )}
          {section === "partners" && (
            <PartnersTable rows={partners.filter((p) => p.status !== "pending")} onOpen={setOpenPartnerId} emptyText="No verified partners yet. Approve an application to get started." />
          )}
          {section === "jobs" && <JobsSection jobs={jobs} onOpen={setOpenJobId} />}
          {section === "promotions" && <PromotionsSection />}
          {section === "employees" && <EmployeesSection />}
          {section === "payouts" && <PayoutsSection rows={jobs.payouts} paid={overview?.money?.payoutsPaid} onOpen={setOpenJobId} />}
        </>
      )}

      <PartnerDrawer
        partner={openPartner}
        onClose={() => setOpenPartnerId(null)}
        busy={busy}
        onChecks={(body) => run(() => httpClient.patch(`/api/v1/partners/${openPartner._id}/checks`, body))}
        onStatus={(status, note) =>
          run(() => httpClient.patch(`/api/v1/partners/${openPartner._id}/status`, { status, note })).then(
            (ok) => ok && setOpenPartnerId(null)
          )
        }
      />

      <JobDrawer
        job={openJob}
        partners={partners}
        employees={employees}
        onClose={() => setOpenJobId(null)}
        busy={busy}
        onAssign={(partnerId) => run(() => httpClient.post(`/api/v1/partners/admin/jobs/${openJob.id}/assign`, { partnerId }))}
        onTeam={async (name, phone, employeeIds) => {
          setBusy(true);
          setError("");
          try {
            const { data } = await httpClient.post(`/api/v1/partners/admin/jobs/${openJob.id}/team`, {
              name,
              phone,
              employeeIds,
            });
            await load();
            const token = data?.data?.fieldToken;
            const job = data?.data;
            if (token && phone) {
              const url = fieldJobUrl(token, window.location.origin);
              const wa = teamWhatsAppLink(
                phone,
                teamJobWhatsAppMessage({
                  teamName: name,
                  serviceCategory: job?.serviceCategory,
                  bookingDate: job?.bookingDate,
                  bookingTime: job?.bookingTime,
                  location: job?.location,
                  fieldUrl: url,
                  accessNotes: job?.customerSecurity?.accessNotes || data?.data?.customerSecurity?.accessNotes,
                })
              );
              if (wa) window.open(wa, "_blank", "noopener,noreferrer");
            }
            return true;
          } catch (err) {
            setError(apiError(err));
            return false;
          } finally {
            setBusy(false);
          }
        }}
        onProgress={(status, expectedMinutes) =>
          run(() => httpClient.post(`/api/v1/partners/admin/jobs/${openJob.id}/progress`, { status, ...(expectedMinutes ? { expectedMinutes } : {}) }))
        }
        onExpected={(expectedMinutes) => run(() => httpClient.post(`/api/v1/partners/admin/jobs/${openJob.id}/expected`, { expectedMinutes }))}
        onPayout={(transferReference) =>
          run(() => httpClient.post(`/api/v1/partners/admin/jobs/${openJob.id}/payout`, { transferReference }))
        }
        onApproveCompletion={() => run(() => httpClient.post(`/api/v1/partners/admin/jobs/${openJob.id}/approve-completion`))}
        onRejectCompletion={(notes) =>
          run(() => httpClient.post(`/api/v1/partners/admin/jobs/${openJob.id}/reject-completion`, { notes }))
        }
      />
    </Shell>
  );
}

/* ============================ Overview ============================ */

function Overview({ data, pending, jobs, go, openJob }) {
  const pipeline = [
    ["confirmed", VENDORS_ENABLED ? "Needs partner" : "Needs team", "bg-amber-400"],
    ...(VENDORS_ENABLED ? [["assigned", "Offered", "bg-sky-400"]] : []),
    ["accepted", VENDORS_ENABLED ? "Accepted" : "Team assigned", "bg-brand-400"],
    ["in_progress", "In progress", "bg-brand-600"],
    ["completion_requested", "Awaiting approval", "bg-amber-500"],
    ["completed", "Completed", "bg-emerald-500"],
  ];
  const totalJobs = pipeline.reduce((s, [k]) => s + (data.jobs[k] || 0), 0);
  const maxArea = Math.max(1, ...data.byArea.map((a) => a.bookings));
  const attention = [
    [pending.length, "partner application", "applications", "to review"],
    [jobs.unassigned.length, "paid job", "jobs", VENDORS_ENABLED ? "without a partner" : "without a team"],
    [jobs.payouts.length, "payout", "payouts", "to send"],
  ].filter(([n]) => (n as number) > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label={VENDORS_ENABLED ? "Booking value" : "Revenue"} value={money(data.money.gmv)} hint={`${data.money.paidBookings} paid bookings`} />
        {!VENDORS_ENABLED && (
          <>
            <Stat label="Needs a team" value={data.jobs.confirmed || 0} hint="Paid and waiting" tone={data.jobs.confirmed ? "amber" : "default"} />
            <Stat label="In progress" value={(data.jobs.accepted || 0) + (data.jobs.in_progress || 0)} hint="Team assigned or working" tone="brand" />
            <Stat label="Completed" value={data.jobs.completed || 0} hint="Finished jobs" />
          </>
        )}
        {VENDORS_ENABLED && <>
        <Stat label="Kliner revenue" value={money(data.money.commission)} hint={`${Math.round(data.commissionRate * 100)}% of completed jobs`} tone="brand" />
        <Stat label="Payouts due" value={money(data.money.payoutsPending)} hint={`${jobs.payouts.length} completed job${jobs.payouts.length === 1 ? "" : "s"}`} tone={data.money.payoutsPending ? "amber" : "default"} />
        <Stat label="Paid to partners" value={money(data.money.payoutsPaid)} hint={`${data.partners.verified || 0} verified partner${data.partners.verified === 1 ? "" : "s"}`} />
        </>}
      </div>

      {attention.length > 0 && (
        <Panel title="Needs your attention" padded={false}>
          <ul className="divide-y divide-stone-100 border-t border-stone-100">
            {attention.map(([n, noun, target, suffix]) => (
              <li key={target as string}>
                <button onClick={() => go(target)} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-stone-50">
                  <span className="h-7 min-w-7 px-2 rounded-full bg-amber-100 text-amber-800 text-[13px] font-bold flex items-center justify-center tabular-nums">{n}</span>
                  <span className="text-[14px] text-stone-800">
                    {noun}
                    {n === 1 ? "" : "s"} {suffix}
                  </span>
                  <ArrowRight size={16} className="ml-auto text-stone-400" />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {data.paymentIssues?.length > 0 && (
        <Panel title="Payments to review" padded={false}>
          <p className="px-5 pb-3 text-[13px] text-stone-600">
            Paystack took money for these bookings, but not the amount we expected, so they are not marked paid. Check the transaction in your Paystack dashboard.
          </p>
          <ul className="divide-y divide-stone-100 border-t border-stone-100">
            {data.paymentIssues.map((p) => (
              <li key={p.id} className="px-5 py-3">
                <p className="text-[14px] font-medium text-stone-900">
                  {p.service}
                  {p.customer ? ` · ${p.customer}` : ""}
                </p>
                <p className="text-[13px] text-amber-800">{p.note}</p>
                <p className={`text-[12px] text-stone-500 ${mono}`}>
                  {p.reference} · expected {money(p.expected)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <Panel title="Job pipeline" className={VENDORS_ENABLED ? "lg:col-span-3" : "lg:col-span-5"} action={<span className="text-[13px] text-stone-500 tabular-nums">{totalJobs} paid jobs</span>}>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-stone-100 mb-4">
            {pipeline.map(([k, , color]) =>
              data.jobs[k] ? <div key={k} className={color} style={{ width: `${(data.jobs[k] / Math.max(1, totalJobs)) * 100}%` }} /> : null
            )}
          </div>
          <div className={`grid grid-cols-2 gap-3 ${VENDORS_ENABLED ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
            {pipeline.map(([k, label, color]) => (
              <div key={k}>
                <div className="flex items-center gap-1.5 text-[12px] text-stone-500">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  {label}
                </div>
                <p className="text-[20px] font-bold tabular-nums mt-0.5">{data.jobs[k] || 0}</p>
              </div>
            ))}
          </div>
        </Panel>

        {VENDORS_ENABLED && <Panel title="Partners" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["verified", "Verified"],
              ["pending", "Pending review"],
              ["suspended", "Suspended"],
              ["rejected", "Rejected"],
            ].map(([k, label]) => (
              <div key={k} className="rounded-lg bg-stone-50 px-3 py-2.5">
                <p className="text-[12px] text-stone-500">{label}</p>
                <p className="text-[20px] font-bold tabular-nums">{data.partners[k] || 0}</p>
              </div>
            ))}
          </div>
        </Panel>}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Panel title="Bookings by area" className="lg:col-span-2">
          {data.byArea.length ? (
            <ul className="space-y-3">
              {data.byArea.map((a) => (
                <li key={a.area}>
                  <div className="flex items-baseline justify-between text-[14px]">
                    <span className="flex items-center gap-1.5 text-stone-800">
                      <MapPin size={13} className="text-stone-400" />
                      {a.area}
                    </span>
                    <span className="tabular-nums text-stone-500 text-[13px]">
                      {a.bookings} · {money(a.value)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(a.bookings / maxArea) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-stone-500">No paid bookings yet.</p>
          )}
        </Panel>

        <Panel title="Recent activity" className="lg:col-span-3" padded={false}>
          {data.recent.length ? (
            <ul className="divide-y divide-stone-100 border-t border-stone-100">
              {data.recent.map((j) => (
                <li key={j.id}>
                  <button onClick={() => openJob(j.id)} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-stone-50">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-stone-900 truncate">
                        {j.serviceCategory} · {j.area}
                      </p>
                      <p className="text-[13px] text-stone-500 truncate">
                        {j.customer?.name || "Customer"} {j.team ? `→ ${j.team.name}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusPill map={JOB_STATUS} value={j.status} />
                      <p className="text-[12px] text-stone-400 mt-1">
                        {timeAgo(j.timeline?.paidOut || j.timeline?.completed || j.timeline?.started || j.timeline?.accepted || j.timeline?.assigned || j.timeline?.paid)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={Inbox} title="No activity yet" />
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ============================ Partners ============================ */

function checkProgress(p) {
  const required = CHECKS.filter((c) => c[3]);
  const done = required.filter(([k]) => p.verificationChecks?.[k]).length;
  return [done, required.length];
}

function PartnersTable({ rows, onOpen, emptyText, isApplications = false }) {
  const [q, setQ] = useState("");
  const filtered = rows.filter((p) =>
    [p.companyName, p.contactName, p.owner?.fullName, p.phone, ...(p.areas || [])].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const columns = [
    {
      key: "company",
      label: "Company",
      render: (p) => (
        <div className="min-w-0">
          <p className="font-semibold text-stone-900 truncate">
            {p.companyName}
            {p.isRegisteredBusiness && <span className="ml-1.5 align-middle text-[11px] font-semibold text-brand-700 bg-brand-50 rounded px-1.5 py-0.5">CAC</span>}
          </p>
          <p className="text-[13px] text-stone-500 truncate">{p.owner?.fullName || p.contactName} · {p.phone}</p>
        </div>
      ),
    },
    {
      key: "services",
      label: "Services",
      render: (p) => <span className="text-stone-700">{p.services.map(serviceLabel).join(", ")}</span>,
    },
    {
      key: "areas",
      label: "Coverage",
      render: (p) => (
        <span className="text-stone-700" title={p.areas.join(", ")}>
          {p.areas.length} area{p.areas.length === 1 ? "" : "s"}
        </span>
      ),
    },
    isApplications
      ? {
          key: "checks",
          label: "Checks",
          render: (p) => {
            const [done, total] = checkProgress(p);
            return (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 rounded-full bg-stone-100">
                  <div className={`h-full rounded-full ${done === total ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${(done / total) * 100}%` }} />
                </div>
                <span className="text-[13px] tabular-nums text-stone-600">
                  {done}/{total} checks
                </span>
              </div>
            );
          },
        }
      : {
          key: "jobs",
          label: "Jobs done",
          align: "right",
          render: (p) => (
            <span className="tabular-nums">
              {p.stats?.jobsCompleted || 0} job{p.stats?.jobsCompleted === 1 ? "" : "s"}{p.rating ? ` · ★ ${p.rating}` : ""}
            </span>
          ),
        },
    {
      key: "when",
      label: isApplications ? "Applied" : "Since",
      render: (p) => <span className="text-stone-500">{shortDate(isApplications ? p.createdAt : p.verifiedAt || p.createdAt)}</span>,
    },
    {
      key: "status",
      label: "Status",
      mobileRight: true,
      render: (p) => <StatusPill map={PARTNER_STATUS} value={p.status} />,
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search company, owner, area…" />
      </div>
      <DataTable
        columns={columns}
        rows={filtered}
        onRowClick={(p) => onOpen(p._id)}
        rowKey={(p) => p._id}
        empty={
          <Panel>
            <Empty icon={Building2} title={q ? "No matches" : "Nothing here"} text={q ? "Try a different search." : emptyText} />
          </Panel>
        }
      />
    </>
  );
}

function PartnerDrawer({ partner, onClose, busy, onChecks, onStatus }) {
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(null); // "rejected" | "suspended" | null

  useEffect(() => {
    setNotes(partner?.verificationChecks?.notes || "");
    setReason("");
    setConfirming(null);
  }, [partner?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!partner) return null;
  const checks = partner.verificationChecks || {};
  const [done, total] = checkProgress(partner);
  const ready = done === total;
  const visibleChecks = CHECKS.filter(([k]) => k !== "cacChecked" || partner.isRegisteredBusiness);

  let footer;
  if (confirming) {
    footer = (
      <div className="space-y-3">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Reason (shown to the partner)"
          className="w-full rounded-lg ring-1 ring-inset ring-stone-300 !border-0 !shadow-none px-3 py-2 text-[14px] text-stone-900 outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex gap-2">
          <Button variant="danger" disabled={busy || !reason.trim()} onClick={() => onStatus(confirming, reason.trim())}>
            Confirm {confirming === "rejected" ? "rejection" : "suspension"}
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(null)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  } else if (partner.status === "pending" || partner.status === "rejected") {
    footer = (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="success" disabled={busy || !ready} onClick={() => onStatus("verified", "")}>
          <CheckCircle2 size={16} /> Verify partner
        </Button>
        {partner.status === "pending" && (
          <Button variant="danger" disabled={busy} onClick={() => setConfirming("rejected")}>
            Reject
          </Button>
        )}
        {!ready && (
          <span className="text-[13px] text-stone-500 ml-1">
            {total - done} required check{total - done === 1 ? "" : "s"} left
          </span>
        )}
      </div>
    );
  } else if (partner.status === "verified") {
    footer = (
      <Button variant="danger" disabled={busy} onClick={() => setConfirming("suspended")}>
        Suspend partner
      </Button>
    );
  } else {
    footer = (
      <Button variant="success" disabled={busy || !ready} onClick={() => onStatus("verified", "")}>
        Reactivate partner
      </Button>
    );
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={partner.companyName}
      subtitle={
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill map={PARTNER_STATUS} value={partner.status} />
          {partner.isRegisteredBusiness ? (
            <Pill tone="brand" dot={false}>
              CAC {partner.cacNumber}
            </Pill>
          ) : (
            <Pill dot={false}>Not CAC registered</Pill>
          )}
          <span className="text-[13px] text-stone-500">Applied {timeAgo(partner.createdAt)}</span>
        </div>
      }
      footer={footer}
    >
      {partner.statusNote && partner.status !== "verified" && <Notice tone="amber">Note to partner: {partner.statusNote}</Notice>}

      {partner.status !== "verified" && (
        <Section
          title="Verification"
          aside={
            <span className={`text-[13px] font-semibold tabular-nums ${ready ? "text-emerald-700" : "text-stone-500"}`}>
              {done}/{total} required
            </span>
          }
        >
          <div className="rounded-lg border border-stone-200 divide-y divide-stone-100">
            {visibleChecks.map(([key, label, hint, required]) => (
              <label key={key} className="flex items-start gap-3 px-3.5 py-3 cursor-pointer hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={Boolean(checks[key])}
                  disabled={busy}
                  onChange={(e) => onChecks({ [key]: e.target.checked })}
                  className="mt-0.5 h-4 w-4"
                />
                <span className="flex-1">
                  <span className="block text-[14px] font-medium text-stone-900">
                    {label} {required && <span className="text-rose-600">*</span>}
                  </span>
                  <span className="block text-[13px] text-stone-500">{hint}</span>
                </span>
                {checks[key] ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Circle size={18} className="text-stone-300" />}
              </label>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Private notes from calls and the visit (not shown to the partner)"
            className="mt-3 w-full rounded-lg ring-1 ring-inset ring-stone-300 !border-0 !shadow-none px-3 py-2 text-[14px] text-stone-900 outline-none focus:ring-2 focus:ring-brand-500"
          />
          {notes !== (checks.notes || "") && (
            <div className="mt-2">
              <Button size="sm" variant="dark" disabled={busy} onClick={() => onChecks({ notes })}>
                Save notes
              </Button>
            </div>
          )}
        </Section>
      )}

      {partner.status === "verified" && (
        <Section title="Performance">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Jobs done" value={partner.stats?.jobsCompleted || 0} />
            <MiniStat label="Rating" value={partner.rating ? `★ ${partner.rating}` : "—"} />
            <MiniStat label="Verified" value={shortDate(partner.verifiedAt)} />
          </div>
          {checks.notes && <p className="mt-3 text-[13px] text-stone-600 bg-stone-50 rounded-lg px-3 py-2">{checks.notes}</p>}
        </Section>
      )}

      <Section title="Business">
        <KV
          rows={[
            ["Office / base", partner.officeAddress],
            ["Team size", `${partner.teamSize} people`],
            ["Years operating", partner.yearsInBusiness],
            ["Services", partner.services.map(serviceLabel).join(", ")],
            partner.about && ["About", partner.about],
          ]}
        />
      </Section>

      <Section title="Coverage">
        <div className="flex flex-wrap gap-1.5">
          {partner.areas.map((a) => (
            <Pill key={a} dot={false}>
              {a}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="Owner & contact">
        <KV
          rows={[
            ["Owner", partner.owner?.fullName],
            ["ID to show", ID_LABELS[partner.owner?.idType]],
            ["Contact person", partner.contactName],
            ["Phone", <a key="p" href={`tel:${partner.phone}`} className="text-brand-700 font-medium">{partner.phone}</a>],
            ["Email", partner.email],
          ]}
        />
      </Section>

      <Section title="Guarantor">
        <KV
          rows={[
            ["Name", partner.guarantor?.fullName],
            ["Phone", partner.guarantor?.phone && <a key="g" href={`tel:${partner.guarantor.phone}`} className="text-brand-700 font-medium">{partner.guarantor.phone}</a>],
            ["Relationship", partner.guarantor?.relationship],
            ["Address", partner.guarantor?.address],
          ]}
        />
      </Section>

      <Section title="Past clients">
        {partner.references?.length ? (
          <KV
            rows={partner.references.map((r, i) => [
              `Client ${i + 1}`,
              <span key={i}>
                {r.name} · <a href={`tel:${r.phone}`} className="text-brand-700 font-medium">{r.phone}</a>
              </span>,
            ])}
          />
        ) : (
          <p className="text-[14px] text-stone-500">None provided.</p>
        )}
      </Section>

      <Section title="Payout account">
        <KV
          rows={[
            ["Bank", partner.bank?.bankName],
            ["Account number", partner.bank?.accountNumber && <span key="a" className={mono}>{partner.bank.accountNumber}</span>],
            ["Account name", partner.bank?.accountName],
          ]}
        />
      </Section>
    </Drawer>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-stone-50 px-3 py-2.5">
      <p className="text-[12px] text-stone-500">{label}</p>
      <p className="text-[16px] font-bold tabular-nums">{value}</p>
    </div>
  );
}

/* ============================ Jobs ============================ */

const jobColumns = [
  {
    key: "service",
    label: "Job",
    render: (j) => (
      <div className="min-w-0">
        <p className="font-semibold text-stone-900 truncate">{j.serviceCategory}</p>
        <p className="text-[13px] text-stone-500 truncate">
          {j.customer?.name || "Customer"} · {j.area}
        </p>
      </div>
    ),
  },
  {
    key: "when",
    label: "Scheduled",
    render: (j) => (
      <span className="text-stone-700 whitespace-nowrap">
        {shortDate(j.bookingDate)} · {j.bookingTime}
      </span>
    ),
  },
  { key: "partner", label: VENDORS_ENABLED ? "Partner" : "Team", render: (j) => <span className="text-stone-700">{j.team?.name || <span className="text-stone-400">Unassigned</span>}</span> },
  { key: "value", label: "Value", align: "right", render: (j) => <span className="font-medium">{money(j.amount)}</span> },
  { key: "status", label: "Status", mobileRight: true, render: (j) => <StatusPill map={JOB_STATUS} value={j.status} /> },
];

function JobsSection({ jobs, onOpen }) {
  const [tab, setTab] = useState("unassigned");
  const rows = { unassigned: jobs.unassigned, active: jobs.active, completed: jobs.completed }[tab];
  const empties = {
    unassigned: ["All caught up", VENDORS_ENABLED ? "Every paid job has a partner." : "Every paid job has a team."],
    active: ["No active jobs", "Assigned and in-progress jobs show here."],
    completed: ["No completed jobs yet", "Finished jobs show here."],
  };
  return (
    <>
      <Tabs
        tabs={[
          ["unassigned", VENDORS_ENABLED ? "Needs partner" : "Needs team", jobs.unassigned.length],
          ["active", "Active", jobs.active.length],
          ["completed", "Completed", jobs.completed.length],
        ]}
        active={tab}
        onChange={setTab}
      />
      <DataTable
        columns={jobColumns}
        rows={rows}
        onRowClick={(j) => onOpen(j.id)}
        empty={
          <Panel>
            <Empty icon={Briefcase} title={empties[tab][0]} text={empties[tab][1]} />
          </Panel>
        }
      />
    </>
  );
}

function JobDrawer({ job, partners, employees, onClose, busy, onAssign, onPayout, onTeam, onProgress, onExpected, onApproveCompletion, onRejectCompletion }) {
  const [partnerId, setPartnerId] = useState("");
  const [reference, setReference] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamPhone, setTeamPhone] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // the expected time starts from what the system estimated for this job
    const total = job?.expectedMinutes || 0;
    setHours(String(Math.floor(total / 60)));
    setMinutes(String(total % 60));
    setPartnerId("");
    setReference("");
    setTeamName(job?.team?.name || "");
    setTeamPhone(job?.team?.phone || "");
    setSelectedEmployeeIds((job?.arrival?.crew || []).map((c) => c.employeeId));
  }, [job?.id, job?.team?.name, job?.team?.phone, job?.expectedMinutes, job?.arrival?.crew]);

  if (!job) return null;

  const paid = job.paymentStatus === "paid";
  const canAssign = VENDORS_ENABLED && ["confirmed", "assigned"].includes(job.status) && paid;
  const canSetTeam = !VENDORS_ENABLED && ["confirmed", "assigned", "accepted"].includes(job.status) && paid;
  const eligible = partners.filter(
    (p) => p.status === "verified" && p.services.includes(job.serviceType) && (!job.area || p.areas.includes(job.area))
  );
  const payoutDue = VENDORS_ENABLED && job.payout?.status === "pending";
  const crewIds = (job?.arrival?.crew || []).map((c) => c.employeeId).sort().join(",");
  const selectedKey = [...selectedEmployeeIds].sort().join(",");
  const teamUnchanged =
    job.status === "accepted" &&
    teamName.trim() === (job.team?.name || "") &&
    teamPhone.trim() === (job.team?.phone || "") &&
    crewIds === selectedKey;
  const nextStep = VENDORS_ENABLED ? null : { accepted: ["in_progress", "Mark as started"] }[job.status];
  const awaitingApproval = !VENDORS_ENABLED && job.status === "completion_requested";
  const fieldLink =
    typeof window !== "undefined" && job.fieldToken
      ? `${window.location.origin}/team/${job.fieldToken}`
      : job.fieldToken
        ? `/team/${job.fieldToken}`
        : "";

  const expectedTotal = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
  const expectedOk = expectedTotal >= 15 && expectedTotal <= 4320;
  const showTime = !VENDORS_ENABLED && ["accepted", "in_progress"].includes(job.status);

  let footer = null;
  if (awaitingApproval) {
    footer = (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Button variant="success" disabled={busy} onClick={() => onApproveCompletion()}>
          Approve completion
        </Button>
        <Button variant="outline" disabled={busy} onClick={() => onRejectCompletion(rejectNote.trim())}>
          Send back to team
        </Button>
      </div>
    );
  } else if (nextStep) {
    const starting = nextStep[0] === "in_progress";
    footer = (
      <Button
        variant="primary"
        disabled={busy || (starting && !expectedOk)}
        onClick={() => onProgress(nextStep[0], starting ? expectedTotal : undefined)}
      >
        {nextStep[1]}
      </Button>
    );
  }
  if (canAssign) {
    footer = (
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={busy || !partnerId || partnerId === job.partner?.id} onClick={() => onAssign(partnerId)}>
          {job.partner ? "Reassign job" : "Assign job"}
        </Button>
        <span className="text-[13px] text-stone-500">They see the customer&apos;s contact only after accepting.</span>
      </div>
    );
  } else if (payoutDue) {
    footer = (
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Bank transfer reference"
          className="h-10 flex-1 rounded-lg ring-1 ring-inset ring-stone-300 !border-0 !shadow-none px-3 text-[14px] text-stone-900 outline-none focus:ring-2 focus:ring-brand-500"
        />
        <Button variant="success" disabled={busy} onClick={() => onPayout(reference.trim())}>
          Mark {money(job.payout.partnerAmount)} as paid
        </Button>
      </div>
    );
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={job.serviceCategory}
      subtitle={
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill map={JOB_STATUS} value={job.status} />
          {VENDORS_ENABLED && job.payout?.status && job.payout.status !== "not_due" && <StatusPill map={PAYOUT_STATUS} value={job.payout.status} />}
          <span className="text-[13px] text-stone-500">
            {serviceLabel(job.serviceType)} · {money(job.amount)}
          </span>
        </div>
      }
      footer={footer}
    >
      {showTime && (
        <Section title="Expected time">
          {job.status === "in_progress" && job.timeline?.started && (
            <div className="mb-4 rounded-lg bg-stone-50 p-4 ring-1 ring-inset ring-stone-200">
              <JobProgress startedAt={job.timeline.started} expectedMinutes={job.expectedMinutes} compact />
              <p className="mt-2 text-[12px] text-stone-500">What the customer sees until the team requests completion and you approve it.</p>
            </div>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-[13px] font-medium text-stone-700">
              Hours
              <input type="number" min={0} max={72} value={hours} onChange={(e) => setHours(e.target.value)} className="mt-1 h-10 w-24 rounded-lg ring-1 ring-inset ring-stone-300 !border-0 !shadow-none px-3 text-[14px] text-stone-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            <label className="text-[13px] font-medium text-stone-700">
              Minutes
              <input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="mt-1 h-10 w-24 rounded-lg ring-1 ring-inset ring-stone-300 !border-0 !shadow-none px-3 text-[14px] text-stone-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            {job.status === "in_progress" && (
              <Button variant="outline" disabled={busy || !expectedOk || expectedTotal === job.expectedMinutes} onClick={() => onExpected(expectedTotal)}>
                Update time
              </Button>
            )}
          </div>
          <p className="mt-2 text-[12px] text-stone-500">
            {expectedOk ? `Customers see progress move over ${formatDuration(expectedTotal)}.` : "Enter between 15 minutes and 3 days."}
            {job.status === "accepted" && " Set it before starting the job."}
          </p>
        </Section>
      )}

      {!VENDORS_ENABLED && job.fieldToken && (
        <Section title="Team field link">
          <p className="text-[13px] text-stone-600 mb-2">
            Share this with the assigned team. They can post cleaning updates and request completion here — no login.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              readOnly
              value={fieldLink}
              className="h-10 flex-1 rounded-lg ring-1 ring-inset ring-stone-300 !border-0 !shadow-none px-3 text-[13px] text-stone-800 outline-none font-mono"
            />
            <Button
              variant="outline"
              disabled={!fieldLink}
              onClick={() => {
                if (!fieldLink) return;
                navigator.clipboard?.writeText(fieldLink);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
            >
              {copiedLink ? "Copied" : "Copy link"}
            </Button>
            {job.team?.phone && (
              <Button
                variant="primary"
                disabled={!fieldLink}
                onClick={() => {
                  const wa = teamWhatsAppLink(
                    job.team.phone,
                    teamJobWhatsAppMessage({
                      teamName: job.team.name || "team",
                      serviceCategory: job.serviceCategory,
                      bookingDate: job.bookingDate,
                      bookingTime: job.bookingTime,
                      location: job.location,
                      fieldUrl: fieldLink.startsWith("http") ? fieldLink : `${typeof window !== "undefined" ? window.location.origin : ""}${fieldLink}`,
                      accessNotes: job.customerSecurity?.accessNotes,
                    })
                  );
                  if (wa) window.open(wa, "_blank", "noopener,noreferrer");
                }}
              >
                Send on WhatsApp
              </Button>
            )}
          </div>
          <p className="text-[12px] text-stone-500 mt-2">
            WhatsApp includes the field link and rules only — not the visit code. The owner sees the code in their app and shares it at the door.
          </p>
        </Section>
      )}

      {(job.fieldReports?.length > 0 || awaitingApproval) && (
        <Section title="Cleaning reports">
          {job.completionRequest?.notes && (
            <p className="text-[14px] text-stone-800 mb-3 rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-inset ring-amber-200">
              <span className="font-semibold">Team completion note: </span>
              {job.completionRequest.notes}
            </p>
          )}
          {awaitingApproval && (
            <label className="block text-[13px] font-medium text-stone-700 mb-3">
              Note if sending back to the team (optional)
              <input
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Please redo the bathroom"
                className="mt-1 h-10 w-full rounded-lg ring-1 ring-inset ring-stone-300 !border-0 !shadow-none px-3 text-[14px] text-stone-900 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
          )}
          {job.fieldReports?.length ? (
            <ol className="space-y-2 max-h-48 overflow-y-auto">
              {[...(job.fieldReports || [])].reverse().map((r, i) => (
                <li key={`${r.at}-${i}`} className="rounded-lg bg-stone-50 px-3 py-2 text-[13px]">
                  {r.reportKind && r.reportKind !== "update" ? (
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand-700 mb-0.5">{r.reportKind}</p>
                  ) : null}
                  {r.message ? <p className="text-stone-800">{r.message}</p> : null}
                  {r.photos?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.photos.map((src) => (
                        <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="Field report" className="h-20 w-20 rounded-md object-cover ring-1 ring-stone-200" />
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-[12px] text-stone-500 mt-0.5">{timeAgo(r.at)}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[13px] text-stone-500">No field updates yet.</p>
          )}
        </Section>
      )}

      {canSetTeam && (
        <Section title={job.status === "accepted" ? "Assigned team" : "Assign a team"}>
          <div className="space-y-2">
            <label className="block text-[13px] font-medium text-stone-700">
              Team or cleaner&apos;s name
              <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="mt-1 h-10 w-full rounded-lg ring-1 ring-inset ring-stone-300 !border-0 !shadow-none px-3 text-[14px] text-stone-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            <label className="block text-[13px] font-medium text-stone-700">
              Phone number
              <input type="tel" value={teamPhone} onChange={(e) => setTeamPhone(e.target.value)} className="mt-1 h-10 w-full rounded-lg ring-1 ring-inset ring-stone-300 !border-0 !shadow-none px-3 text-[14px] text-stone-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            <div className="pt-2">
              <p className="text-[13px] font-medium text-stone-700 mb-2">Crew on this job (from employee roster)</p>
              {employees.length === 0 ? (
                <p className="text-[12px] text-amber-800 bg-amber-50 rounded-lg px-3 py-2">Add employees under Admin → Employees first.</p>
              ) : (
                <ul className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg ring-1 ring-inset ring-stone-200 p-2">
                  {employees
                    .filter((e) => e.status === "active")
                    .map((e) => {
                      const on = selectedEmployeeIds.includes(e.employee_id);
                      return (
                        <li key={e.employee_id}>
                          <label className="flex items-center gap-2 text-[13px] cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() =>
                                setSelectedEmployeeIds((ids) =>
                                  on ? ids.filter((id) => id !== e.employee_id) : [...ids, e.employee_id]
                                )
                              }
                            />
                            <span className="font-medium text-stone-900">{e.fullName}</span>
                            <span className="text-stone-500 font-mono text-[11px]">{e.bvnMasked}</span>
                          </label>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant={job.status === "accepted" ? "outline" : "primary"}
                disabled={busy || !teamName.trim() || !teamPhone.trim() || !selectedEmployeeIds.length || teamUnchanged}
                onClick={() => onTeam(teamName.trim(), teamPhone.trim(), selectedEmployeeIds)}
              >
                {job.status === "accepted" ? "Update team" : "Assign team"}
              </Button>
              <span className="text-[13px] text-stone-500">The customer sees this name and number.</span>
            </div>
          </div>
        </Section>
      )}

      {job.customerSecurity && (
        <Section title="Property owner safety">
          <KV
            rows={[
              [
                "Visit code (owner only)",
                job.customerSecurity.visitorCode || "Generated when team is assigned",
              ],
              ["Access notes", job.customerSecurity.accessNotes || "—"],
              ["Belongings rule acknowledged", job.customerSecurity.belongingsAcknowledged ? "Yes" : "No"],
              ["Limited access acknowledged", job.customerSecurity.limitedAccessAcknowledged ? "Yes" : "No"],
            ]}
          />
          {job.customerSecurity.issueReports?.length > 0 && (
            <div className="mt-4">
              <p className="text-[13px] font-semibold text-rose-800 mb-2">Owner incident reports</p>
              <ol className="space-y-2 max-h-40 overflow-y-auto">
                {[...(job.customerSecurity.issueReports || [])].reverse().map((r, i) => (
                  <li key={`${r.at}-${i}`} className="rounded-lg bg-rose-50 px-3 py-2 text-[13px] ring-1 ring-inset ring-rose-100">
                    <p className="text-stone-900">{r.message}</p>
                    {r.photos?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {r.photos.map((src) => (
                          <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="Owner report" className="h-16 w-16 rounded-md object-cover ring-1 ring-stone-200" />
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="text-[12px] text-stone-500 mt-0.5">{timeAgo(r.at)}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Section>
      )}

      {job.arrival?.crew?.length > 0 && (
        <Section title="Arrival log">
          <KV
            rows={[
              ["Team arrived", job.arrival.arrivedAt ? longDate(job.arrival.arrivedAt) : "Not recorded yet"],
              ["Presence", `${job.arrival.checkIns?.length || 0} of ${job.arrival.crew.length} confirmed`],
            ]}
          />
          <ul className="mt-3 space-y-2">
            {job.arrival.crew.map((m) => {
              const hit = job.arrival.checkIns?.find((c) => c.employeeId === m.employeeId);
              return (
                <li key={m.employeeId} className="flex items-center justify-between text-[13px] rounded-lg bg-stone-50 px-3 py-2">
                  <span className="font-medium text-stone-900">{m.name}</span>
                  {hit ? (
                    <span className="text-emerald-700 font-semibold">{longDate(hit.checkedInAt)} ✓</span>
                  ) : (
                    <span className="text-amber-700">Awaiting tap-in</span>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {VENDORS_ENABLED && job.declinedBy > 0 && (
        <Notice tone="amber">
          Declined by {job.declinedBy} partner{job.declinedBy === 1 ? "" : "s"} so far.
        </Notice>
      )}

      {canAssign && (
        <Section title={`Choose a partner in ${job.area}`}>
          {eligible.length ? (
            <div className="space-y-2">
              {eligible.map((p) => {
                const selected = partnerId === p._id;
                const current = job.partner?.id === p._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => setPartnerId(p._id)}
                    className={`w-full text-left rounded-lg px-3.5 py-3 ring-inset transition-colors ${
                      selected ? "ring-2 ring-brand-600 bg-brand-50/50" : "ring-1 ring-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-stone-900">{p.companyName}</p>
                      {current && <Pill tone="sky">Currently offered</Pill>}
                    </div>
                    <p className="text-[13px] text-stone-500">
                      {p.stats?.jobsCompleted || 0} job{p.stats?.jobsCompleted === 1 ? "" : "s"} done{p.rating ? ` · ★ ${p.rating}` : ""} · team of {p.teamSize} · {p.areas.length} areas
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <Notice tone="amber">
              No verified partner offers {serviceLabel(job.serviceType).toLowerCase()} in {job.area} yet.
            </Notice>
          )}
        </Section>
      )}

      {payoutDue && (
        <Section title="Payout">
          <KV
            rows={[
              ["Job value", money(job.amount)],
              [`Kliner fee (${Math.round((job.payout.commissionRate || 0) * 100)}%)`, money(job.payout.commissionAmount)],
              ["Pay partner", <b key="p" className="text-stone-900">{money(job.payout.partnerAmount)}</b>],
              ["Partner", job.partner?.name],
            ]}
          />
        </Section>
      )}

      {VENDORS_ENABLED && job.payout?.status === "paid" && (
        <Section title="Payout">
          <KV
            rows={[
              ["Paid to partner", money(job.payout.partnerAmount)],
              ["Kliner fee", money(job.payout.commissionAmount)],
              ["Transfer ref", job.payout.transferReference && <span key="r" className={mono}>{job.payout.transferReference}</span>],
              ["Paid on", longDate(job.payout.paidAt)],
            ]}
          />
        </Section>
      )}

      <Section title="Progress">
        <Timeline
          steps={
            VENDORS_ENABLED
              ? [
                  ["Booked", job.timeline?.booked],
                  ["Paid", job.timeline?.paid],
                  ["Offered to partner", job.timeline?.assigned, job.partner?.name],
                  ["Partner accepted", job.timeline?.accepted],
                  ["Work started", job.timeline?.started],
                  ["Completed", job.timeline?.completed],
                  ["Partner paid", job.timeline?.paidOut],
                ]
              : [
                  ["Booked", job.timeline?.booked],
                  ["Paid", job.timeline?.paid],
                  ["Team assigned", job.timeline?.accepted, job.team?.name],
                  ["Team arrived", job.arrival?.arrivedAt],
                  ["Work started", job.timeline?.started],
                  ["Completion requested", job.completionRequest?.requestedAt],
                  ["Completed", job.timeline?.completed],
                ]
          }
        />
      </Section>

      <Section title="Booking">
        <KV
          rows={[
            ["Date", longDate(job.bookingDate)],
            ["Time", job.bookingTime],
            ["Area", job.area],
            ["Address", job.location],
            ["Customer", job.customer?.name],
            ["Phone", job.customer?.phone && <a key="c" href={`tel:${job.customer.phone}`} className="text-brand-700 font-medium">{job.customer.phone}</a>],
            ["Notes", job.customer?.notes],
            ["Reference", job.paymentReference && <span key="ref" className={mono}>{job.paymentReference}</span>],
          ]}
        />
      </Section>

      {job.serviceDetails?.cleaningDetails && (
        <Section title="Cleaning details">
          <KV
            rows={[
              ["Package", job.serviceDetails.cleaningDetails.package],
              ["Home size", job.serviceDetails.cleaningDetails.homeSize],
              ["Frequency", job.serviceDetails.cleaningDetails.frequency],
              [
                "Rooms",
                Object.entries(job.serviceDetails.cleaningDetails.rooms || {})
                  .filter(([, n]) => Number(n) > 0)
                  .map(([r, n]) => `${r} × ${n}`)
                  .join(", "),
              ],
            ]}
          />
        </Section>
      )}
    </Drawer>
  );
}

/* ============================ Payouts ============================ */

function PayoutsSection({ rows, paid, onOpen }) {
  const due = rows.reduce((s, j) => s + (j.payout?.partnerAmount || 0), 0);
  const fees = rows.reduce((s, j) => s + (j.payout?.commissionAmount || 0), 0);
  const columns = [
    {
      key: "partner",
      label: "Partner",
      render: (j) => (
        <div className="min-w-0">
          <p className="font-semibold text-stone-900 truncate">{j.partner?.name}</p>
          <p className="text-[13px] text-stone-500 truncate">
            {j.serviceCategory} · {j.area}
          </p>
        </div>
      ),
    },
    { key: "done", label: "Completed", render: (j) => <span className="text-stone-600">{shortDate(j.completedAt)}</span> },
    { key: "value", label: "Job value", align: "right", hideOnMobile: true, render: (j) => money(j.amount) },
    { key: "fee", label: "Kliner fee", align: "right", hideOnMobile: true, render: (j) => <span className="text-stone-500">{money(j.payout?.commissionAmount)}</span> },
    { key: "pay", label: "Pay partner", align: "right", mobileRight: true, render: (j) => <span className="font-semibold text-stone-900">{money(j.payout?.partnerAmount)}</span> },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="To pay now" value={money(due)} tone={due ? "amber" : "default"} hint={`${rows.length} job${rows.length === 1 ? "" : "s"}`} />
        <Stat label="Kliner fees" value={money(fees)} hint="on these jobs" />
        <Stat label="Paid so far" value={money(paid)} hint="all time" />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        onRowClick={(j) => onOpen(j.id)}
        empty={
          <Panel>
            <Empty icon={Wallet} title="No payouts due" text="When a partner completes a job, what you owe them appears here." />
          </Panel>
        }
      />
    </div>
  );
}

/* ============================ misc ============================ */

function SkeletonGrid() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[98px] rounded-xl bg-white border border-stone-200" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-white border border-stone-200" />
    </div>
  );
}
