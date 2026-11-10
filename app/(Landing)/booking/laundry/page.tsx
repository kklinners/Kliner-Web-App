"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ServiceHeader from "../../../components/ServiceHeader";
import { PRICING, formatNaira } from "../../../../utils/pricing";

const OPTIONS = [
  {
    id: "washed-folded",
    title: "Washed and Folded",
    description: "Washed properly, then folded neatly and returned to you.",
    steps: ["Wash", "Fold"],
  },
  {
    id: "washed-ironed",
    title: "Washed and Ironed",
    description: "Washed properly, then pressed so it's ready to wear.",
    steps: ["Wash", "Iron"],
  },
  {
    id: "washed-ironed-folded",
    title: "Washed, Ironed, and Folded",
    description: "The full service: washed, pressed and folded.",
    steps: ["Wash", "Iron", "Fold"],
  },
];

export default function LaundryPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = OPTIONS.find((o) => o.id === selectedId) || null;
  const priceOf = (id) => PRICING.laundry.options[id]?.price;

  const handleContinue = () => {
    if (!selected) return;
    localStorage.setItem("laundryOption", selected.title);
    localStorage.setItem(
      "pendingBooking",
      JSON.stringify({
        serviceType: "laundry",
        serviceName: "Laundry Service",
        serviceCategory: selected.title,
        serviceData: {
          option: selected.id,
          service: selected.title,
          category: selected.title,
        },
        details: [{ label: "Pricing", value: "Per laundry bag (up to ~15 items)" }],
      })
    );
    localStorage.removeItem("bookingSchedule");
    router.push("/booking-summary");
  };

  return (
    <div className="min-h-screen bg-[#EFEDE8] pb-32 lg:pb-16">
      <ServiceHeader />

      <main className="mx-auto max-w-[1280px] px-5 sm:px-8 pt-4 lg:pt-10 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-8 lg:gap-16 items-start">
        <section className="lg:sticky lg:top-8">
          <h1 className="text-[44px] sm:text-[64px] lg:text-[clamp(56px,5.6vw,88px)] font-extrabold tracking-[-0.035em] leading-[1.02] text-brand-950">
            Laundry
          </h1>
          <p className="mt-4 text-[17px] text-brand-900/70 max-w-md">
            Tell us how you want it done. One price covers a laundry bag, up to about 15 items.
          </p>
          <Image
            src="/services/laundry-1.jpg"
            alt="Illustration of a Kliner team member in uniform doing laundry"
            width={1400}
            height={1050}
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="mt-6 lg:mt-10 w-full h-auto max-h-[230px] sm:max-h-[320px] lg:max-h-none object-contain object-center lg:object-left"
          />
        </section>

        <section aria-labelledby="options-title">
          <h2 id="options-title" className="text-[20px] font-semibold tracking-[-0.02em] text-brand-950 border-b-2 border-brand-950 pb-2.5">
            How should we do it?
          </h2>

          <div role="radiogroup" aria-labelledby="options-title" className="mt-5 space-y-3">
            {OPTIONS.map((option) => {
              const on = selectedId === option.id;
              return (
                <label key={option.id} className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name="laundry-option"
                    value={option.id}
                    checked={on}
                    onChange={() => setSelectedId(option.id)}
                    className="peer sr-only"
                  />
                  <div
                    className={`flex items-start gap-4 rounded-2xl p-5 sm:p-6 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#EFEDE8] ${
                      on ? "bg-brand-600 text-white" : "bg-white text-brand-950 hover:bg-brand-50"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1 h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center ${on ? "border-white" : "border-brand-900/30"}`}
                    >
                      {on && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[19px] sm:text-[21px] font-semibold tracking-[-0.01em] leading-snug">{option.title}</span>
                      <span className={`mt-1 block text-[15px] leading-relaxed ${on ? "text-white/85" : "text-brand-900/70"}`}>{option.description}</span>
                      <span className={`mt-3 block text-[13px] font-bold uppercase tracking-[0.08em] ${on ? "text-brand-200" : "text-brand-600"}`}>
                        {option.steps.join("  ·  ")}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[22px] sm:text-[26px] font-extrabold tracking-[-0.02em] leading-none">{formatNaira(priceOf(option.id))}</span>
                      <span className={`mt-1.5 block text-[13px] ${on ? "text-white/80" : "text-brand-900/60"}`}>per bag</span>
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="fixed bottom-0 inset-x-0 z-20 bg-[#EFEDE8] border-t border-brand-900/15 px-5 py-3 flex items-center gap-4 lg:static lg:bg-transparent lg:border-0 lg:px-0 lg:py-0 lg:mt-8">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-brand-900/60">{selected ? selected.title : "Nothing chosen yet"}</p>
              <p className="text-[22px] font-extrabold tracking-[-0.02em] text-brand-950 leading-tight">
                {selected ? formatNaira(priceOf(selected.id)) : "Pick one above"}
              </p>
            </div>
            <button
              onClick={handleContinue}
              disabled={!selected}
              className="h-[52px] px-9 rounded-full bg-brand-600 text-white text-[17px] font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-600"
            >
              Continue
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
