"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { httpClient } from "../../../../utils/httpClient";
import { isAuthenticated } from "../../../../utils/tokenService";
import { setPostAuthRedirect } from "../../../../utils/postAuthRedirect";
import { SERVICE_AREAS, LAUNCH_DISTRICT, SERVICE_TYPE_LABELS } from "../../../../utils/serviceAreas";

const apiError = (err) => err?.response?.data?.message || err?.response?.data?.error || err.message;

const inputClass =
  "w-full h-11 rounded-lg bg-white px-3.5 text-[15px] text-stone-900 ring-1 ring-inset ring-stone-300 !border-0 !shadow-none outline-none focus:ring-2 focus:ring-brand-600 placeholder:text-stone-400";

function Field({ label, hint = "", optional = false, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="flex items-baseline gap-2 text-[14px] font-medium text-stone-900 mb-1.5">
        {label}
        {optional && <span className="text-[12px] font-normal text-stone-400">Optional</span>}
      </span>
      {children}
      {hint && <span className="block text-[13px] text-stone-500 mt-1.5">{hint}</span>}
    </label>
  );
}

function Chip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[14px] font-medium ring-1 ring-inset transition-colors ${
        selected ? "bg-stone-900 text-white ring-stone-900" : "bg-white text-stone-700 ring-stone-300 hover:ring-stone-400"
      }`}
    >
      {selected && <Check size={14} strokeWidth={3} />}
      {children}
    </button>
  );
}

function FormSection({ n, title, text, children }) {
  return (
    <section className="grid lg:grid-cols-[260px_1fr] gap-4 lg:gap-10 py-8 border-t border-stone-200 first:border-t-0">
      <div>
        <p className="tabular-nums text-[13px] font-semibold text-brand-700">0{n}</p>
        <h2 className="mt-1 text-[17px] font-semibold text-stone-900">{title}</h2>
        {text && <p className="mt-1 text-[14px] text-stone-500 leading-relaxed">{text}</p>}
      </div>
      <div className="bg-white rounded-xl ring-1 ring-stone-200 p-5 sm:p-6 space-y-5">{children}</div>
    </section>
  );
}

export default function PartnerApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    officeAddress: "",
    isRegisteredBusiness: false,
    cacNumber: "",
    owner: { fullName: "", idType: "" },
    guarantor: { fullName: "", phone: "", relationship: "", address: "" },
    references: [
      { name: "", phone: "" },
      { name: "", phone: "" },
    ],
    teamSize: 1,
    yearsInBusiness: 0,
    about: "",
    services: ["house_cleaning"],
    areas: [],
    bank: { bankName: "", accountNumber: "", accountName: "" },
  });
  const [existing, setExisting] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Vendors need an account first: send them to sign up, then back here
    if (!isAuthenticated()) {
      setPostAuthRedirect("/partners/apply");
      router.replace("/partners");
      return;
    }
    httpClient
      .get("/api/v1/partners/me")
      .then(({ data }) => setExisting(data.data))
      .catch(() => {});
  }, [router]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setBank = (key, value) => setForm((f) => ({ ...f, bank: { ...f.bank, [key]: value } }));
  const setNested = (group, key, value) => setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));
  const setReference = (i, key, value) =>
    setForm((f) => ({
      ...f,
      references: f.references.map((r, j) => (j === i ? { ...r, [key]: value } : r)),
    }));
  const toggle = (key, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.services.length) return setError("Select at least one service you offer.");
    if (!form.areas.length) return setError(`Select at least one ${LAUNCH_DISTRICT} area you cover.`);
    setSubmitting(true);
    try {
      await httpClient.post("/api/v1/partners/apply", form);
      router.push("/partner");
    } catch (err) {
      setError(apiError(err));
      setSubmitting(false);
    }
  };

  const topBar = (
    <header className="bg-white border-b border-stone-200">
      <div className="max-w-5xl mx-auto h-16 px-5 sm:px-8 flex items-center gap-2.5">
        <Link href="/partners" className="flex items-center gap-2.5">
          <Image src="/klin-logo.png" alt="Kliner" width={28} height={28} className="rounded-md" />
          <span className="font-bold tracking-tight">Kliner</span>
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Vendor application</span>
      </div>
    </header>
  );

  if (existing && existing.status !== "rejected") {
    return (
      <div className="min-h-screen bg-[#F7F7F5] text-stone-900">
        {topBar}
        <div className="max-w-lg mx-auto px-5 py-16">
          <h1 className="text-[24px] font-bold tracking-tight">You&apos;ve already applied</h1>
          <p className="text-stone-600 mt-2 mb-6">
            {existing.companyName} is currently <b>{existing.status}</b>.
          </p>
          <button onClick={() => router.push("/partner")} className="h-11 px-5 rounded-lg bg-stone-900 text-white font-semibold">
            Go to your dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-stone-900">
      {topBar}

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-5 sm:px-8 pb-24">
        <div className="pt-10 pb-6">
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight">Apply to join Kliner</h1>
          <p className="mt-2 text-[16px] text-stone-600 max-w-2xl">
            Takes about 5 minutes. After you submit, we&apos;ll call your guarantor and past clients, then visit your base to
            see the owner&apos;s ID. No CAC registration needed.
          </p>
          {existing?.status === "rejected" && (
            <div className="mt-5 rounded-lg bg-amber-50 ring-1 ring-amber-200 px-4 py-3 text-[14px] text-amber-900">
              Your previous application wasn&apos;t approved{existing.statusNote ? `: ${existing.statusNote}` : "."} Update your
              details and resubmit.
            </div>
          )}
        </div>

        <FormSection n={1} title="Your business" text="How customers and our team will know you.">
          <Field label="Business name">
            <input required className={inputClass} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Sparkle Hands Cleaning" />
          </Field>
          <Field label="Office or base address" hint="Where we'll visit you during verification.">
            <input required className={inputClass} value={form.officeAddress} onChange={(e) => set("officeAddress", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Team size">
              <input type="number" min={1} className={inputClass} value={form.teamSize} onChange={(e) => set("teamSize", Number(e.target.value))} />
            </Field>
            <Field label="Years operating">
              <input type="number" min={0} className={inputClass} value={form.yearsInBusiness} onChange={(e) => set("yearsInBusiness", Number(e.target.value))} />
            </Field>
          </div>
          <Field label="About your business" optional hint="What you're great at, equipment you use, types of homes you clean.">
            <textarea rows={3} maxLength={1000} className={`${inputClass} h-auto py-2.5`} value={form.about} onChange={(e) => set("about", e.target.value)} />
          </Field>
          <div className="rounded-lg bg-stone-50 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={form.isRegisteredBusiness} onChange={(e) => set("isRegisteredBusiness", e.target.checked)} />
              <span>
                <span className="block text-[14px] font-medium">My business is registered with CAC</span>
                <span className="block text-[13px] text-stone-500">Optional — registered businesses get a badge.</span>
              </span>
            </label>
            {form.isRegisteredBusiness && (
              <Field label="CAC number (RC or BN)" className="mt-4">
                <input required className={inputClass} value={form.cacNumber} onChange={(e) => set("cacNumber", e.target.value)} />
              </Field>
            )}
          </div>
        </FormSection>

        <FormSection n={2} title="Owner" text="We only note which ID you'll show — we never store ID numbers.">
          <Field label="Owner's full name" hint="Exactly as it appears on the ID.">
            <input required className={inputClass} value={form.owner.fullName} onChange={(e) => setNested("owner", "fullName", e.target.value)} />
          </Field>
          <Field label="ID you'll show us">
            <select required className={inputClass} value={form.owner.idType} onChange={(e) => setNested("owner", "idType", e.target.value)}>
              <option value="" disabled>
                Choose one
              </option>
              <option value="nin">NIN slip / National ID card</option>
              <option value="voters_card">Voter&apos;s card</option>
              <option value="drivers_licence">Driver&apos;s licence</option>
              <option value="intl_passport">International passport</option>
            </select>
          </Field>
        </FormSection>

        <FormSection n={3} title="Contact person" text="Who we call about jobs and payouts.">
          <Field label="Full name">
            <input required className={inputClass} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone">
              <input required type="tel" className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="080…" />
            </Field>
            <Field label="Email" optional hint="Defaults to your account email.">
              <input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
          </div>
        </FormSection>

        <FormSection n={4} title="Guarantor" text="Someone who knows the owner well and can vouch for the business — a pastor, landlord, or family member.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name">
              <input required className={inputClass} value={form.guarantor.fullName} onChange={(e) => setNested("guarantor", "fullName", e.target.value)} />
            </Field>
            <Field label="Phone">
              <input required type="tel" className={inputClass} value={form.guarantor.phone} onChange={(e) => setNested("guarantor", "phone", e.target.value)} />
            </Field>
            <Field label="Relationship" optional>
              <input className={inputClass} value={form.guarantor.relationship} onChange={(e) => setNested("guarantor", "relationship", e.target.value)} />
            </Field>
            <Field label="Address" optional>
              <input className={inputClass} value={form.guarantor.address} onChange={(e) => setNested("guarantor", "address", e.target.value)} />
            </Field>
          </div>
        </FormSection>

        <FormSection n={5} title="Past clients" text="Two customers you've cleaned for recently. We'll give them a short call.">
          {form.references.map((r, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <Field label={`Client ${i + 1} name`}>
                <input className={inputClass} value={r.name} onChange={(e) => setReference(i, "name", e.target.value)} />
              </Field>
              <Field label="Phone">
                <input type="tel" className={inputClass} value={r.phone} onChange={(e) => setReference(i, "phone", e.target.value)} />
              </Field>
            </div>
          ))}
        </FormSection>

        <FormSection n={6} title="Services & coverage" text={`You'll only be offered jobs for these services, in these ${LAUNCH_DISTRICT} areas.`}>
          <div>
            <p className="text-[14px] font-medium mb-2">Services you offer</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SERVICE_TYPE_LABELS).map(([id, label]) => (
                <Chip key={id} selected={form.services.includes(id)} onClick={() => toggle("services", id)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[14px] font-medium">Areas you cover</p>
              <button
                type="button"
                className="text-[13px] font-semibold text-brand-700"
                onClick={() => set("areas", form.areas.length === SERVICE_AREAS.length ? [] : [...SERVICE_AREAS])}
              >
                {form.areas.length === SERVICE_AREAS.length ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SERVICE_AREAS.map((a) => (
                <Chip key={a} selected={form.areas.includes(a)} onClick={() => toggle("areas", a)}>
                  {a}
                </Chip>
              ))}
            </div>
          </div>
        </FormSection>

        <FormSection n={7} title="Payout account" text="Where we send your earnings. It must be in the owner's or the business's name.">
          <Field label="Bank">
            <input className={inputClass} value={form.bank.bankName} onChange={(e) => setBank("bankName", e.target.value)} placeholder="e.g. GTBank" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Account number">
              <input
                inputMode="numeric"
                maxLength={10}
                className={`${inputClass} tabular-nums`}
                value={form.bank.accountNumber}
                onChange={(e) => setBank("accountNumber", e.target.value.replace(/\D/g, ""))}
              />
            </Field>
            <Field label="Account name">
              <input className={inputClass} value={form.bank.accountName} onChange={(e) => setBank("accountName", e.target.value)} />
            </Field>
          </div>
        </FormSection>

        <div className="lg:pl-[300px] pt-4">
          {error && <div className="mb-4 rounded-lg bg-rose-50 ring-1 ring-rose-200 px-4 py-3 text-[14px] text-rose-800">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-stone-900 text-white text-[15px] font-semibold hover:bg-stone-800 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit application"}
          </button>
          <p className="mt-3 text-[13px] text-stone-500">You can track your verification from your vendor dashboard.</p>
        </div>
      </form>
    </div>
  );
}
