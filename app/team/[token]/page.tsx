"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { CalendarDays, Camera, CheckCircle2, Clock, MapPin, Phone, User } from "lucide-react";
import JobProgress from "../../components/JobProgress";
import { PageLoader } from "../../components/KlinerLoader";
import { JOB_STATUS } from "../../components/dash/ui";
import {
  BELONGINGS_TEAM_NOTICE,
  LIMITED_ACCESS_NOTICE,
  VISIT_CODE_TEAM_INSTRUCTION,
} from "../../../utils/ownerSafety";
import { SERVICE_TYPE_LABELS } from "../../../utils/serviceAreas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const MAX_PHOTOS = 6;

type FieldReport = {
  message: string;
  at: string;
  photos?: string[];
};

type FieldJob = {
  id: string;
  serviceType?: string;
  serviceCategory: string;
  serviceName?: string;
  status: string;
  bookingDate: string;
  bookingTime: string;
  area: string;
  location: string;
  expectedMinutes: number;
  startedAt?: string;
  customer?: { name?: string; phone?: string; notes?: string };
  reports: FieldReport[];
  completionRequest?: { requestedAt: string; notes: string } | null;
  propertyRules?: {
    belongings?: boolean;
    limitedAccessNotes?: string;
    limitedAccessAcknowledged?: boolean;
  };
  arrival?: {
    arrivedAt: string | null;
    allCheckedIn: boolean;
    crew: {
      employeeId: string;
      name: string;
      profilePhotoUrl?: string;
      checkedIn: boolean;
    }[];
    checkIns: { employeeId: string; name: string; checkedInAt: string }[];
  };
};

function categoryTitle(job: FieldJob) {
  const fromCategory = job.serviceCategory?.trim();
  if (fromCategory) return fromCategory;
  const fromType = job.serviceType && SERVICE_TYPE_LABELS[job.serviceType as keyof typeof SERVICE_TYPE_LABELS];
  if (fromType) return fromType;
  return job.serviceName?.trim() || "Service";
}

function statusChip(status: string) {
  const row = JOB_STATUS[status as keyof typeof JOB_STATUS];
  const label = row?.[0] || status;
  const tone = row?.[1] || "neutral";
  const styles: Record<string, string> = {
    brand: "bg-brand-100 text-brand-800",
    amber: "bg-amber-100 text-amber-900",
    green: "bg-emerald-100 text-emerald-800",
    sky: "bg-sky-100 text-sky-800",
    neutral: "bg-gray-100 text-gray-700",
    red: "bg-rose-100 text-rose-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-wide ${styles[tone] || styles.neutral}`}>
      {label}
    </span>
  );
}

function Card({ title, children, id }: { title?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {title && <h2 className="text-[17px] font-extrabold tracking-tight text-brand-950">{title}</h2>}
      {children}
    </section>
  );
}

const primaryBtn =
  "h-12 w-full rounded-2xl bg-brand-600 text-white text-[15px] font-bold hover:bg-brand-700 disabled:opacity-50 disabled:pointer-events-none transition-colors";
const outlineBtn =
  "h-12 rounded-2xl border-2 border-brand-200 bg-white text-brand-800 text-[15px] font-bold hover:bg-brand-50 disabled:opacity-50 transition-colors px-4";

export default function TeamFieldPage() {
  const { token } = useParams<{ token: string }>();
  const [job, setJob] = useState<FieldJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [finishNotes, setFinishNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [reportKind, setReportKind] = useState<"update" | "before" | "after">("update");
  const [visitorCode, setVisitorCode] = useState("");
  const [belongingsAck, setBelongingsAck] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const clearPhotos = useCallback(() => {
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPhotos([]);
    setPreviews([]);
    if (fileRef.current) fileRef.current.value = "";
  }, [previews]);

  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/partners/field/jobs/${encodeURIComponent(token)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Couldn't load this job.");
      setJob(data.data);
    } catch (e) {
      setError(e.message || "Couldn't load this job.");
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const postJson = async (path: string, body?: object | null) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/partners/field/jobs/${encodeURIComponent(token)}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : "{}",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Request failed.");
      setJob(data.data);
      setMessage("");
      setFinishNotes("");
      setConfirmFinish(false);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const sendReport = async () => {
    const text = message.trim();
    if (text.length < 3 && photos.length === 0) {
      setError("Write an update or add at least one photo.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("message", text);
      fd.append("reportKind", reportKind);
      photos.forEach((file) => fd.append("images", file));
      const res = await fetch(
        `${API_BASE_URL}/api/v1/partners/field/jobs/${encodeURIComponent(token)}/reports`,
        { method: "POST", body: fd }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Could not send update.");
      setJob(data.data);
      setMessage("");
      clearPhotos();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const onPickPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (!picked.length) return;
    const merged = [...photos, ...picked].slice(0, MAX_PHOTOS);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPhotos(merged);
    setPreviews(merged.map((f) => URL.createObjectURL(f)));
  };

  if (loading) {
    return <PageLoader label="Loading your job" />;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center">
          <span role="img" aria-label="Kliner" className="logo-mask mx-auto aspect-[318/342] h-10 text-brand-600" />
          <p className="mt-4 text-lg font-extrabold text-brand-950">Link not valid</p>
          <p className="mt-2 text-[15px] text-brand-900/70">{error || "Ask Kliner for a new team link."}</p>
        </div>
      </div>
    );
  }

  const title = categoryTitle(job);
  const updatesTitle = `${title} updates`;
  const canReport = ["accepted", "in_progress", "completion_requested"].includes(job.status);
  const canRequestDone = job.status === "in_progress";
  const waitingApproval = job.status === "completion_requested";
  const when = new Date(job.bookingDate).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-gray-50 text-brand-950">
      <div className="mx-auto max-w-md min-h-screen bg-white shadow-lg">
        <header className="flex items-start justify-between px-4 pt-4">
          <div className="w-[68px] h-[76px] bg-brand-600 text-white flex items-center justify-center shrink-0">
            <span role="img" aria-label="Kliner" className="logo-mask aspect-[318/342] h-9" />
          </div>
          <div className="pt-3 text-right">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Field team</p>
            <p className="text-[13px] font-semibold text-brand-900/60">Job sheet</p>
          </div>
        </header>

        <div className="px-4 pb-2">
          <h1 className="text-[clamp(26px,7vw,32px)] font-extrabold tracking-[-0.03em] leading-tight text-brand-950">
            {title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {statusChip(job.status)}
            <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-900/70">
              <CalendarDays size={15} className="text-brand-600" />
              {when} · {job.bookingTime}
            </span>
          </div>
        </div>

        <main className="px-4 pb-10 space-y-4">
          <div className="rounded-2xl bg-brand-100 border border-brand-200/80 px-4 py-3 text-[14px] leading-snug text-brand-950 space-y-2">
            <p className="font-extrabold text-brand-800 text-[12px] uppercase tracking-wide">Property owner safety</p>
            <p>{BELONGINGS_TEAM_NOTICE}</p>
            <p>{LIMITED_ACCESS_NOTICE}</p>
            {job.propertyRules?.limitedAccessNotes ? (
              <p className="font-semibold">Owner: {job.propertyRules.limitedAccessNotes}</p>
            ) : null}
            <label className="flex items-start gap-2 text-[13px] font-bold cursor-pointer">
              <input type="checkbox" checked={belongingsAck} onChange={(e) => setBelongingsAck(e.target.checked)} />
              I confirm our crew will follow these rules
            </label>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-[14px] font-medium text-rose-900">
              {error}
            </div>
          )}

          {waitingApproval && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-[14px] text-amber-950">
              <p className="font-bold">Waiting on Kliner</p>
              <p className="mt-1 text-amber-900/90">Admin will approve completion soon.</p>
              {job.completionRequest?.notes && (
                <p className="mt-2 text-[13px]">Your note: {job.completionRequest.notes}</p>
              )}
            </div>
          )}

          {job.arrival?.crew?.length ? (
            <Card title="Arrival & presence">
              <p className="mt-1 text-[14px] text-brand-900/70 leading-snug">
                {VISIT_CODE_TEAM_INSTRUCTION} Each person on the roster must then tap their name to confirm they are on site.
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                <Clock size={18} className="text-brand-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-brand-900/50">Arrival time</p>
                  <p className="text-[15px] font-bold text-brand-950">
                    {job.arrival.arrivedAt
                      ? new Date(job.arrival.arrivedAt).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Not recorded yet"}
                  </p>
                </div>
                {!job.arrival.arrivedAt && (
                  <div className="shrink-0 space-y-2 w-full sm:w-auto">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Visit code from owner"
                      value={visitorCode}
                      onChange={(e) => setVisitorCode(e.target.value.replace(/\D/g, ""))}
                      className="h-10 w-full sm:w-40 rounded-xl border-2 border-brand-200 px-3 text-[15px] font-bold"
                    />
                    <button
                      type="button"
                      className={`${outlineBtn} !h-10 !text-[13px] w-full`}
                      disabled={busy || !belongingsAck || visitorCode.length !== 6}
                      onClick={() => postJson("/arrival", { visitorCode })}
                    >
                      Record arrival
                    </button>
                  </div>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {job.arrival.crew.map((member) => {
                  const tap = job.arrival?.checkIns?.find((c) => c.employeeId === member.employeeId);
                  return (
                    <li
                      key={member.employeeId}
                      className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-3 ${
                        member.checkedIn ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-white"
                      }`}
                    >
                      {member.profilePhotoUrl ? (
                        <Image
                          src={member.profilePhotoUrl}
                          alt=""
                          width={44}
                          height={44}
                          className="rounded-full h-11 w-11 object-cover"
                        />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold">
                          {member.name.charAt(0)}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-brand-950">{member.name}</p>
                        {tap ? (
                          <p className="text-[12px] font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Present ·{" "}
                            {new Date(tap.checkedInAt).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}
                          </p>
                        ) : (
                          <p className="text-[12px] text-brand-900/60">Tap to confirm you are on site</p>
                        )}
                      </div>
                      {!member.checkedIn && job.arrival.arrivedAt && (
                        <button
                          type="button"
                          className="shrink-0 rounded-xl bg-brand-600 px-3 py-2 text-[13px] font-bold text-white disabled:opacity-40"
                          disabled={busy}
                          onClick={() => postJson("/check-in", { employeeId: member.employeeId })}
                        >
                          I&apos;m here
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              {job.arrival.arrivedAt && !job.arrival.allCheckedIn && (
                <p className="mt-3 text-[13px] font-semibold text-amber-800">
                  {job.arrival.checkIns?.length || 0} of {job.arrival.crew.length} crew confirmed — everyone must tap in.
                </p>
              )}
            </Card>
          ) : null}

          <Card title="Where & who">
            <dl className="mt-3 space-y-3 text-[15px]">
              <div className="flex gap-3">
                <MapPin size={18} className="text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-[12px] font-bold uppercase tracking-wide text-brand-900/50">Address</dt>
                  <dd className="font-semibold text-brand-950">{job.location || job.area}</dd>
                </div>
              </div>
              {job.customer?.name && (
                <div className="flex gap-3">
                  <User size={18} className="text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-[12px] font-bold uppercase tracking-wide text-brand-900/50">Customer</dt>
                    <dd className="font-semibold">{job.customer.name}</dd>
                  </div>
                </div>
              )}
              {job.customer?.phone && (
                <div className="flex gap-3">
                  <Phone size={18} className="text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-[12px] font-bold uppercase tracking-wide text-brand-900/50">Phone</dt>
                    <dd>
                      <a href={`tel:${job.customer.phone}`} className="font-bold text-brand-700 underline underline-offset-2">
                        {job.customer.phone}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {job.customer?.notes && (
                <p className="text-[14px] text-brand-900/80 rounded-xl bg-gray-50 p-3">{job.customer.notes}</p>
              )}
            </dl>
          </Card>

          {job.status === "in_progress" && job.startedAt && (
            <Card title="Live progress">
              <div className="mt-2">
                <JobProgress startedAt={job.startedAt} expectedMinutes={job.expectedMinutes} compact />
              </div>
            </Card>
          )}

          <Card title={updatesTitle} id="updates">
            <p className="mt-1 text-[14px] text-brand-900/70">
              Tell admin how the job is going. Photos optional (up to {MAX_PHOTOS}).
            </p>

            {job.reports.length > 0 ? (
              <ol className="mt-4 space-y-3 max-h-72 overflow-y-auto">
                {[...job.reports].reverse().map((r, i) => (
                  <li key={`${r.at}-${i}`} className="rounded-xl bg-brand-50/80 border border-brand-100 px-3 py-3">
                    {r.message ? <p className="text-[15px] font-medium text-brand-950">{r.message}</p> : null}
                    {r.photos?.length ? (
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {r.photos.map((src) => (
                          <a
                            key={src}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-brand-200"
                          >
                            <Image src={src} alt="Job update" fill className="object-cover" sizes="120px" />
                          </a>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-[12px] font-semibold text-brand-900/50 mt-2">
                      {new Date(r.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-[14px] text-brand-900/50">No updates posted yet.</p>
            )}

            {canReport && (
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  {(["update", "before", "after"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setReportKind(k)}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-bold capitalize ${
                        reportKind === k ? "bg-brand-600 text-white" : "bg-gray-100 text-brand-800"
                      }`}
                    >
                      {k === "update" ? "Progress" : k}
                    </button>
                  ))}
                </div>
                <label className="block text-[13px] font-bold text-brand-800" htmlFor="team-update">
                  New update
                </label>
                <textarea
                  id="team-update"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder={`What's done on this ${title.toLowerCase()} job?`}
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-[15px] outline-none focus:border-brand-500 focus:bg-white transition-colors"
                />
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickPhotos} />
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {previews.map((src, idx) => (
                      <div key={src} className="relative h-16 w-16 rounded-xl overflow-hidden ring-2 ring-brand-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          aria-label="Remove photo"
                          className="absolute inset-x-0 bottom-0 bg-brand-950/80 text-white text-[10px] font-bold py-0.5"
                          onClick={() => {
                            URL.revokeObjectURL(src);
                            setPhotos((p) => p.filter((_, j) => j !== idx));
                            setPreviews((p) => p.filter((_, j) => j !== idx));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className={`${outlineBtn} flex items-center justify-center gap-2 sm:w-auto sm:flex-1`}
                    disabled={busy || photos.length >= MAX_PHOTOS}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Camera size={18} />
                    Photos {photos.length}/{MAX_PHOTOS}
                  </button>
                  <button
                    type="button"
                    className={`${primaryBtn} sm:flex-[2]`}
                    disabled={busy || (message.trim().length < 3 && photos.length === 0)}
                    onClick={sendReport}
                  >
                    {busy ? "Sending…" : "Send update"}
                  </button>
                </div>
              </div>
            )}
          </Card>

          {canRequestDone && !confirmFinish && (
            <button type="button" className={primaryBtn} disabled={busy} onClick={() => setConfirmFinish(true)}>
              Finish job — request approval
            </button>
          )}

          {confirmFinish && (
            <Card title="Request completion">
              <p className="mt-1 text-[14px] text-brand-900/70">Kliner admin reviews your updates before closing the job.</p>
              <textarea
                value={finishNotes}
                onChange={(e) => setFinishNotes(e.target.value)}
                rows={2}
                placeholder="Optional summary for admin"
                className="mt-3 w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-[15px] outline-none focus:border-brand-500 focus:bg-white"
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className={`${primaryBtn} bg-emerald-600 hover:bg-emerald-700 sm:flex-1`}
                  disabled={busy}
                  onClick={() => postJson("/request-completion", { notes: finishNotes.trim() })}
                >
                  Send for approval
                </button>
                <button type="button" className={outlineBtn} disabled={busy} onClick={() => setConfirmFinish(false)}>
                  Not yet
                </button>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
