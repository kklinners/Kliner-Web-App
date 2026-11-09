"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Check, X } from "lucide-react";
import { httpClient } from "../../../utils/httpClient";
import { isAuthenticated } from "../../../utils/tokenService";
import { setPostAuthRedirect } from "../../../utils/postAuthRedirect";
import { LAUNCH_DISTRICT, COMMISSION_RATE, SERVICE_AREAS } from "../../../utils/serviceAreas";

const KEEP = Math.round((1 - COMMISSION_RATE) * 100);

const STEPS = [
  ["Create an account", "Sign up with your email and confirm the code we send you."],
  ["Apply in 5 minutes", "Your services, the areas you cover, a guarantor and two past clients."],
  ["Get verified", "We call your guarantor and clients, then visit your base to see your ID."],
  ["Receive jobs", `Accept bookings near you. Get paid ${KEEP}% after every completed job.`],
];

const NEED = [
  "Owner's ID — NIN slip, voter's card, driver's licence or passport",
  "A bank account in the owner's or business's name",
  "A guarantor we can call",
  "Two past clients we can call",
  "An office or base we can visit",
];

const DONT_NEED = ["CAC registration", "A sign-up fee", "Your own website or marketing", "To chase customers for payment"];

// A real-looking job request, so vendors see exactly what they'll get
function SampleJob() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-brand-100/60 rotate-2" aria-hidden />
      <div className="relative bg-white rounded-2xl border border-stone-200 shadow-[0_20px_50px_-20px_rgba(28,25,23,0.25)] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-stone-500">New job request</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2 py-0.5 text-[12px] font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
            <span className="h-1.5 w-1.5 rounded-full bg-current" /> Offered
          </span>
        </div>
        <div className="flex gap-4">
          <div className="w-14 shrink-0 rounded-lg border border-stone-200 text-center overflow-hidden self-start">
            <p className="bg-stone-900 text-white text-[11px] font-semibold uppercase tracking-wider py-0.5">Sat</p>
            <p className="text-[22px] font-bold leading-8">14</p>
            <p className="text-[11px] text-stone-500 pb-1">Nov</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-stone-900">Deep Cleaning</p>
            <p className="text-[13px] text-stone-500 flex flex-wrap gap-x-3 mt-0.5">
              <span className="inline-flex items-center gap-1"><Clock size={13} />10:00 AM</span>
              <span className="inline-flex items-center gap-1"><MapPin size={13} />Ifako-Gbagada</span>
            </p>
            <p className="mt-2 text-[13px] text-stone-600">Medium home · Bedrooms × 2 · Bathrooms × 1 · Kitchen × 1</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-end justify-between gap-3">
          <div>
            <p className="text-[12px] text-stone-500">You&apos;ll earn</p>
            <p className="text-[22px] font-bold tracking-tight">₦31,875</p>
          </div>
          <div className="flex gap-2">
            <span className="h-9 px-3 rounded-lg ring-1 ring-inset ring-stone-300 text-[13px] font-semibold flex items-center">Decline</span>
            <span className="h-9 px-3 rounded-lg bg-brand-600 text-white text-[13px] font-semibold flex items-center">Accept job</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const router = useRouter();
  // "guest" | "none" | "pending" | "verified" | "rejected" | "suspended"
  const [state, setState] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setState("guest");
      return;
    }
    httpClient
      .get("/api/v1/partners/me")
      .then(({ data }) => setState(data.data?.status || "none"))
      .catch(() => setState("none"));
  }, []);

  const startSignup = () => {
    setPostAuthRedirect("/partners/apply");
    router.push("/auth/signup");
  };
  const startLogin = () => {
    setPostAuthRedirect("/partners/apply");
    router.push("/auth/signin");
  };

  const primary = {
    guest: ["Sign up as a vendor", startSignup],
    none: ["Start your application", () => router.push("/partners/apply")],
    rejected: ["Update your application", () => router.push("/partners/apply")],
    pending: ["View application status", () => router.push("/partner")],
    suspended: ["View account status", () => router.push("/partner")],
    verified: ["Open vendor dashboard", () => router.push("/partner")],
  }[state] || ["Sign up as a vendor", () => {}];

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-stone-900">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-[#F7F7F5]/90 backdrop-blur border-b border-stone-200/70">
        <div className="max-w-6xl mx-auto h-16 px-5 sm:px-8 flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/klin-logo.png" alt="Kliner" width={28} height={28} className="rounded-md" />
            <span className="font-bold tracking-tight">Kliner</span>
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">for vendors</span>
          <div className="ml-auto">
            {state === "guest" ? (
              <button onClick={startLogin} className="text-[14px] font-semibold text-stone-700 hover:text-stone-900">
                Log in
              </button>
            ) : state && state !== "none" ? (
              <button onClick={primary[1]} className="text-[14px] font-semibold text-stone-700 hover:text-stone-900">
                Dashboard →
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 lg:pt-20 pb-16 lg:pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-stone-200 px-3 py-1 text-[13px] font-medium text-stone-700 mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Now onboarding cleaning companies in {LAUNCH_DISTRICT}
          </p>
          <h1 className="text-[36px] sm:text-[48px] lg:text-[56px] font-bold tracking-[-0.03em] leading-[1.05]">
            Your team cleans.
            <br />
            <span className="text-brand-700">We bring the jobs.</span>
          </h1>
          <p className="mt-5 text-[17px] text-stone-600 max-w-lg leading-relaxed">
            Kliner sends paid bookings from homes in {LAUNCH_DISTRICT} straight to your phone. Customers pay upfront, so you
            never chase money — you keep {KEEP}% of every job.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={primary[1]}
              disabled={!state}
              className="h-12 px-6 rounded-xl bg-stone-900 text-white text-[15px] font-semibold hover:bg-stone-800 transition-colors"
            >
              {primary[0]}
            </button>
            {state === "guest" && (
              <button onClick={startLogin} className="h-12 px-6 rounded-xl bg-white ring-1 ring-inset ring-stone-300 text-[15px] font-semibold hover:bg-stone-50">
                I already have an account
              </button>
            )}
          </div>
          <p className="mt-4 text-[13px] text-stone-500">No CAC needed · No sign-up fee</p>
        </div>
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <SampleJob />
        </div>
      </section>

      {/* Numbers */}
      <section className="border-y border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
          {[
            [`${KEEP}%`, "of every job is yours", `Kliner's ${Math.round(COMMISSION_RATE * 100)}% fee covers customers, payments and support.`],
            ["₦0", "to join", "No sign-up fee, no monthly subscription."],
            [`${SERVICE_AREAS.length}`, `${LAUNCH_DISTRICT} areas`, "Pick only the neighbourhoods your team can reach."],
          ].map(([big, label, text]) => (
            <div key={label} className="py-8 sm:px-8 first:sm:pl-0 last:sm:pr-0">
              <p className="text-[40px] font-bold tracking-tight leading-none">{big}</p>
              <p className="mt-2 font-semibold text-stone-900">{label}</p>
              <p className="mt-1 text-[14px] text-stone-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
        <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight max-w-md">From sign-up to your first job</h2>
        <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-stone-200 rounded-2xl overflow-hidden ring-1 ring-stone-200">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="bg-white p-6">
              <p className="tabular-nums text-[13px] text-brand-700 font-semibold">0{i + 1}</p>
              <p className="mt-3 font-semibold text-[17px] text-stone-900">{title}</p>
              <p className="mt-1.5 text-[14px] text-stone-600 leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Requirements */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 lg:pb-24 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl ring-1 ring-stone-200 p-6 sm:p-8">
          <h3 className="text-[20px] font-bold tracking-tight">What you&apos;ll need</h3>
          <ul className="mt-5 space-y-3">
            {NEED.map((n) => (
              <li key={n} className="flex gap-3 text-[15px] text-stone-700">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check size={13} strokeWidth={3} />
                </span>
                {n}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl ring-1 ring-stone-200 p-6 sm:p-8">
          <h3 className="text-[20px] font-bold tracking-tight">What you don&apos;t need</h3>
          <ul className="mt-5 space-y-3">
            {DONT_NEED.map((n) => (
              <li key={n} className="flex gap-3 text-[15px] text-stone-700">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center">
                  <X size={13} strokeWidth={3} />
                </span>
                {n}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] text-stone-500">
            Registered with CAC? Add your number when you apply and you&apos;ll get a &ldquo;CAC registered&rdquo; badge.
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-[24px] sm:text-[28px] font-bold tracking-tight">Ready to fill your calendar?</p>
            <p className="text-stone-400 mt-1">Applications are reviewed within a few days.</p>
          </div>
          <button
            onClick={primary[1]}
            disabled={!state}
            className="h-12 px-6 rounded-xl bg-white text-stone-900 text-[15px] font-semibold hover:bg-stone-100 shrink-0"
          >
            {primary[0]}
          </button>
        </div>
      </section>
    </div>
  );
}
