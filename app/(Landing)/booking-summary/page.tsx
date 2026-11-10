"use client";

import ServiceHeader from "../../components/ServiceHeader";
import { PageLoader } from "../../components/KlinerLoader";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Cookies from "js-cookie";
import DateTimeSelector from "../../components/DateTimeSelector";
import { calculatePrice, formatNaira } from "../../../utils/pricing";
import { BELONGINGS_ENTRANCE_NOTICE, LIMITED_ACCESS_NOTICE } from "../../../utils/ownerSafety";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// Where "Edit Booking" sends the user for each service
const EDIT_ROUTES = {
  house_cleaning: "/booking/house-cleaning",
  laundry: "/booking/laundry",
  move_out: "/booking/moving",
  repairs: "/booking/repairs",
  gardening: "/booking/gardning",
};

const readJSON = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

const formatTime = (time) => {
  if (!time) return "";
  if (/am|pm/i.test(time)) return time; // already "8:00 AM"
  const [h, m = "00"] = time.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${suffix}`;
};

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-NG", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

const SectionHeader = ({ title, subtitle, icon }) => (
  <div className="flex items-center mb-6">
    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mr-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
      </svg>
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  </div>
);

const Row = ({ label, children, highlight = false }) => (
  <div className="border-b pb-4 flex justify-between gap-4">
    <span className="text-gray-600">{label}</span>
    <span className={`text-right ${highlight ? "text-brand-600 font-semibold" : "text-gray-900 font-semibold"}`}>
      {children}
    </span>
  </div>
);

const ICONS = {
  service:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  money:
    "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export default function BookingSummary() {
  const router = useRouter();
  const [booking, setBooking] = useState(null); // { serviceType, serviceName, serviceCategory, serviceData, details }
  const [schedule, setSchedule] = useState(null); // { bookingDate, bookingTime, location }
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState("");
  const [limitedAccess, setLimitedAccess] = useState(true);
  const [accessNotes, setAccessNotes] = useState("");
  const [belongingsAck, setBelongingsAck] = useState(false);

  useEffect(() => {
    const pending = readJSON("pendingBooking");
    const stored = readJSON("bookingSchedule");
    // Schedules saved before area selection existed are incomplete
    const savedSchedule = stored?.area ? stored : null;
    setBooking(pending);
    setSchedule(savedSchedule);
    if (pending && !savedSchedule) setIsSchedulerOpen(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <PageLoader label="Loading your booking" />
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen text-black flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Booking Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t find your booking information. Let&apos;s start over.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700"
          >
            Choose a Service
          </button>
        </div>
      </div>
    );
  }

  // Same calculation the backend uses before charging
  const price = calculatePrice(booking.serviceType, booking.serviceData);

  const handleScheduleSubmit = (newSchedule) => {
    localStorage.setItem("bookingSchedule", JSON.stringify(newSchedule));
    setSchedule(newSchedule);
    setIsSchedulerOpen(false);
  };

  // Each booking attempt gets one key, kept while the details stay the same. If the connection
  // drops and the customer presses the button again, the server hands back the same booking
  // instead of creating a second one.
  const attemptKey = (fingerprint: string) => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("bookingAttempt") || "null");
      if (saved?.fp === fingerprint && saved?.key) return saved.key;
    } catch {}
    const key =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, "")
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
    try {
      sessionStorage.setItem("bookingAttempt", JSON.stringify({ fp: fingerprint, key }));
    } catch {}
    return key;
  };

  const handleConfirmBooking = async () => {
    if (submittingRef.current) return; // a second tap while the first is still going
    setError("");
    if (!schedule) {
      setIsSchedulerOpen(true);
      return;
    }
    if (!belongingsAck || !limitedAccess) {
      setError("Please confirm the property safety rules before paying.");
      return;
    }

    const authToken = Cookies.get("auth_token");
    if (!authToken) {
      setError("Please log in again to complete your booking.");
      return;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setError("You're offline, so nothing was sent and you haven't been charged. Reconnect and press the button again.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    const serviceData = { ...booking.serviceData, estimatedPrice: price.total };
    const key = attemptKey(JSON.stringify({ type: booking.serviceType, serviceData: booking.serviceData, schedule }));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/services/create`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          serviceType: booking.serviceType,
          serviceData,
          bookingDetails: schedule,
          customerInfo: booking.customerInfo || {},
          customerSecurity: {
            belongingsAcknowledged: belongingsAck,
            limitedAccessAcknowledged: limitedAccess,
            accessNotes: accessNotes.trim(),
          },
          idempotencyKey: key,
          returnOrigin: window.location.origin,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Booking failed (${response.status})`);
      }

      const { authorization_url, reference } = data.data.payment;
      // Kept so the payment can still be found if the customer loses connection on the way back
      try {
        localStorage.setItem("lastPaymentReference", JSON.stringify({ reference, at: Date.now() }));
      } catch {}

      if (data.data.alreadyPaid) {
        window.location.href = `/booking-confirmation?reference=${encodeURIComponent(reference)}`;
        return;
      }
      window.location.href = authorization_url;
    } catch (err) {
      console.error("Booking failed:", err);
      const lostConnection = err?.name === "AbortError" || err instanceof TypeError;
      setError(
        lostConnection
          ? "The connection dropped before we heard back. You haven't been charged. Press the button again and you won't be booked twice."
          : err.message || "Booking failed. Please try again."
      );
      setSubmitting(false);
      submittingRef.current = false;
    } finally {
      clearTimeout(timer);
    }
  };

  return (
    <>
      <Head>
        <title>Booking Summary | Kliner</title>
      </Head>

      <DateTimeSelector
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onSubmit={handleScheduleSubmit}
      />

      <div className="min-h-screen text-black bg-gray-50">
        <ServiceHeader title="Booking Summary" subtitle="Check everything, then pay" width="narrow" />

        <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 pb-40">
          {/* Service Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <SectionHeader title="Service Details" subtitle={`Overview of your ${booking.serviceName.toLowerCase()}`} icon={ICONS.service} />
            <div className="space-y-4">
              <Row label="Service">{booking.serviceCategory}</Row>
              <Row label="Done by">A Kliner team in your area</Row>
              {(booking.details || []).map((d) => (
                <Row key={d.label} label={d.label}>{d.value}</Row>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between">
              <SectionHeader title="Schedule Details" subtitle="When and where we'll come" icon={ICONS.calendar} />
              <button onClick={() => setIsSchedulerOpen(true)} className="text-sm text-brand-600 font-semibold hover:underline">
                {schedule ? "Change" : "Add"}
              </button>
            </div>
            {schedule ? (
              <div className="space-y-4">
                <Row label="Date">{formatDate(schedule.bookingDate)}</Row>
                <Row label="Time">{formatTime(schedule.bookingTime)}</Row>
                <Row label="Area">{schedule.area}</Row>
                <Row label="Address">{schedule.location}</Row>
              </div>
            ) : (
              <button
                onClick={() => setIsSchedulerOpen(true)}
                className="w-full py-3 border-2 border-dashed border-brand-300 text-brand-600 rounded-lg font-semibold hover:bg-brand-50"
              >
                Choose date, time &amp; address
              </button>
            )}
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-brand-950">Property safety</h2>
            <p className="text-sm text-brand-900/80">{BELONGINGS_ENTRANCE_NOTICE}</p>
            <p className="text-sm text-brand-900/80">{LIMITED_ACCESS_NOTICE}</p>
            <label className="flex items-start gap-3 text-sm font-medium text-brand-950 cursor-pointer">
              <input type="checkbox" className="mt-1" checked={belongingsAck} onChange={(e) => setBelongingsAck(e.target.checked)} />
              I will keep belongings at the entrance and only booked areas will be accessed.
            </label>
            <label className="flex items-start gap-3 text-sm font-medium text-brand-950 cursor-pointer">
              <input type="checkbox" className="mt-1" checked={limitedAccess} onChange={(e) => setLimitedAccess(e.target.checked)} />
              I agree to the limited-access rules above.
            </label>
            <label className="block text-sm font-medium text-brand-800">
              Which rooms or areas are included? (optional)
              <textarea
                value={accessNotes}
                onChange={(e) => setAccessNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Living room, kitchen and 2 bedrooms only"
                className="mt-1 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
              />
            </label>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <SectionHeader title="Pricing Details" subtitle="Breakdown of your service cost" icon={ICONS.money} />
            <div className="space-y-4">
              <Row label="Base Fee">{formatNaira(price.basePrice)}</Row>
              {price.additionalCharges.map((c) => (
                <Row key={c.description} label={c.description}>{formatNaira(c.amount)}</Row>
              ))}
              {price.discounts.map((d) => (
                <Row key={d.description} label={d.description}>
                  <span className="text-green-600">−{formatNaira(d.amount)}</span>
                </Row>
              ))}
              <div className="pt-2 flex justify-between">
                <span className="text-gray-800 font-semibold">Total</span>
                <span className="font-bold text-brand-600 text-xl">{formatNaira(price.total)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{error}</div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-md">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3">
            <button
              onClick={() => router.push(EDIT_ROUTES[booking.serviceType] || "/")}
              className="py-3 px-6 border border-brand-600 text-brand-600 rounded-xl text-lg font-semibold hover:bg-brand-50 md:flex-1"
            >
              Edit Booking
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={submitting || price.total <= 0}
              className="py-3 px-6 bg-brand-600 text-white rounded-xl text-lg font-semibold shadow-lg hover:bg-brand-700 md:flex-1"
            >
              {submitting ? "Redirecting to payment..." : `Confirm & Pay ${formatNaira(price.total)}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
