"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PromotionCard from "./PromotionCard";
import KlinerLoader from "./KlinerLoader";
import { SERVICES, openService } from "./serviceCatalog";
import { httpClient } from "../../utils/httpClient";
import { SERVICE_NAME } from "../../utils/promotions";

// Offers the admin has switched on. With none live, the whole section stays out of the way.
export default function SpecialOffers() {
  const router = useRouter();
  const [items, setItems] = useState<any[] | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    httpClient
      .get("/api/v1/promotions")
      .then(({ data }) => setItems(data.data || []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    if (!items || items.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % items.length), 6000);
    return () => clearInterval(timer);
  }, [items, paused]);

  if (items === null) {
    return (
      <div className="flex min-h-[176px] items-center justify-center rounded-2xl bg-brand-50">
        <KlinerLoader size={32} tone="brand" />
      </div>
    );
  }
  if (!items.length) return null;

  const current = Math.min(active, items.length - 1);
  const book = (promo) => () => {
    const service = SERVICES.find((s) => s.name === SERVICE_NAME[promo.service]);
    if (service) openService(router, service);
  };

  return (
    <section
      aria-label="Special offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-black lg:text-2xl">Special offers</h2>
        {items.length > 1 && (
          <div className="flex items-center gap-1.5">
            {items.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show offer ${i + 1}: ${p.title}`}
                aria-current={i === current}
                className="flex h-6 w-4 items-center justify-center"
              >
                <span className={`block h-1.5 rounded-full transition-all ${i === current ? "w-5 bg-brand-600" : "w-1.5 bg-brand-200"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Every offer sits in the same box, so the card keeps one height whichever is showing */}
      <div className="grid">
        {items.map((promo, i) => (
          <div
            key={promo.id}
            aria-hidden={i !== current}
            className={`col-start-1 row-start-1 transition-opacity duration-200 ${i === current ? "visible opacity-100" : "invisible opacity-0"}`}
          >
            <PromotionCard promo={promo} onBook={promo.service ? book(promo) : null} />
          </div>
        ))}
      </div>
    </section>
  );
}
