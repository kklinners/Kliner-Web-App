"use client";

import KlinerLoader from "../../components/KlinerLoader";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatNaira } from "../../../utils/pricing";
import { BELONGINGS_ENTRANCE_NOTICE, LIABILITY_NOTICE } from "../../../utils/ownerSafety";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const MESSAGES = {
  checking: ["Confirming your payment…", "This only takes a moment."],
  starting: ["Confirming your payment…", "This only takes a moment."],
  retrying: ["Still checking your payment…", "The connection is slow, or your payment is still being processed. We'll keep trying."],
  offline: ["You're offline", "We'll check your payment as soon as you're back online. If you've paid, your money is safe."],
  review: ["We received your payment", "The amount doesn't match this booking, so our team will review it. You don't need to pay again."],
  paid: ["Booking confirmed!", "Your payment went through and your booking is in."],
  failed: ["Payment not completed", "We couldn't find a completed payment for this booking. Please try again."],
  error: ["We couldn't confirm it yet", "If you paid, your money is safe and we'll confirm it automatically. You can also check again, or look in My Bookings."],
  none: ["No payment to confirm", "Your bookings and their payment status are in My Bookings."],
};

const SPINNING = ["checking", "starting", "retrying"];
const SOFT = ["ongoing", "pending", "processing", "queued"]; // Paystack is still working on it

const ICONS = {
  offline: ["bg-yellow-100 text-yellow-600", "M12 9v4m0 4h.01"],
  review: ["bg-brand-100 text-brand-600", "M5 13l4 4L19 7"],
  paid: ["bg-green-100 text-green-600", "M5 13l4 4L19 7"],
  failed: ["bg-red-100 text-red-600", "M6 18L18 6M6 6l12 12"],
  error: ["bg-yellow-100 text-yellow-600", "M12 9v4m0 4h.01"],
  none: ["bg-brand-100 text-brand-600", "M12 9v4m0 4h.01"],
};

const formatTime = (time) => {
  if (!time || /am|pm/i.test(time)) return time || "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  return `${hour % 12 || 12}:${minutes} ${hour < 12 ? "AM" : "PM"}`;
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900 text-right break-all">{children}</span>
    </div>
  );
}

function Confirmation() {
  const router = useRouter();
  const params = useSearchParams();
  // Paystack sends the customer back with ?reference=...&trxref=...
  const urlReference = params.get("reference") || params.get("trxref");
  const [reference, setReference] = useState(urlReference);
  const [status, setStatus] = useState(urlReference ? "checking" : "starting");
  const [receipt, setReceipt] = useState(null);
  const [again, setAgain] = useState(0);

  // Came back without the link (lost signal, closed the tab)? The booking page kept the reference.
  useEffect(() => {
    if (urlReference) return;
    try {
      const saved = JSON.parse(localStorage.getItem("lastPaymentReference") || "null");
      if (saved?.reference && Date.now() - saved.at < 24 * 3600 * 1000) {
        setReference(saved.reference);
        return;
      }
    } catch {}
    setStatus("none");
  }, [urlReference]);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    let timer;
    let attempt = 0;
    const DELAYS = [2000, 4000, 8000, 15000, 30000];

    const retryLater = () => {
      if (cancelled) return;
      if (attempt < DELAYS.length) {
        setStatus("retrying");
        timer = setTimeout(run, DELAYS[attempt++]);
      } else {
        setStatus("error");
      }
    };

    const run = async () => {
      if (cancelled) return;
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setStatus("offline"); // the 'online' event below picks it up again
        return;
      }
      setStatus((s) => (s === "retrying" || s === "offline" ? "checking" : s));
      const controller = new AbortController();
      const abort = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/services/verify-payment`, {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.ok && data.success) {
          setReceipt(data.data);
          setStatus("paid");
          try {
            localStorage.removeItem("lastPaymentReference");
          } catch {}
        } else if (response.status === 409 && data.code === "amount_mismatch") {
          setStatus("review");
        } else if (response.status >= 500 || response.status === 429 || (response.status === 400 && SOFT.includes(data.payment_status))) {
          retryLater();
        } else {
          setStatus("failed");
        }
      } catch {
        retryLater(); // no connection, or it took too long
      } finally {
        clearTimeout(abort);
      }
    };

    const onOnline = () => {
      attempt = 0;
      clearTimeout(timer);
      run();
    };
    window.addEventListener("online", onOnline);
    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [reference, again]);

  const [title, message] = MESSAGES[status];
  const icon = SPINNING.includes(status) ? null : ICONS[status];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 w-full max-w-lg text-center">
        {icon ? (
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${icon[0]}`}>
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon[1]} />
            </svg>
          </div>
        ) : (
          <div className="flex justify-center mb-5"><KlinerLoader size={64} tone="brand" /></div>
        )}

        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{message}</p>

        {status === "paid" && (
          <div className="mt-4 text-left text-sm text-gray-600 space-y-2 bg-brand-50 rounded-lg p-4 border border-brand-100">
            <p>{BELONGINGS_ENTRANCE_NOTICE}</p>
            <p>{LIABILITY_NOTICE}</p>
          </div>
        )}

        {receipt && (
          <div className="mt-6 bg-gray-50 rounded-lg px-4 py-2 text-left divide-y divide-gray-200 text-sm">
            <Row label="Service">{receipt.service}</Row>
            <Row label="Date">{formatDate(receipt.bookingDate)}</Row>
            <Row label="Time">{formatTime(receipt.bookingTime)}</Row>
            <Row label="Amount paid">{formatNaira(receipt.amount)}</Row>
            <Row label="Reference">{receipt.reference}</Row>
          </div>
        )}

        {!SPINNING.includes(status) && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {status === "failed" && (
              <button onClick={() => router.push("/booking-summary")} className="flex-1 py-3 rounded-lg bg-brand-600 text-white font-medium">
                Try again
              </button>
            )}
            {(status === "error" || status === "offline") && (
              <button onClick={() => setAgain((n) => n + 1)} className="flex-1 py-3 rounded-lg bg-brand-600 text-white font-medium">
                Check again
              </button>
            )}
            <button
              onClick={() => router.push("/booking/bookings")}
              className={`flex-1 py-3 rounded-lg font-medium ${
                status === "paid" || status === "none" ? "bg-brand-600 text-white" : "border border-brand-600 text-brand-600"
              }`}
            >
              My Bookings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <Confirmation />
    </Suspense>
  );
}
