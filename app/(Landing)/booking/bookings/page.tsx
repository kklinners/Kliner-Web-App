// app/dashboard/bookings/page.tsx
"use client";

import Select from "../../../components/Select";
import JobProgress from "../../../components/JobProgress";
import OwnerSafetyTimeline from "../../../components/OwnerSafetyTimeline";
import { OWNER_STATUS_LABELS } from "../../../../utils/ownerSafety";
import ServiceHeader from "../../../components/ServiceHeader";
import { PageLoader } from "../../../components/KlinerLoader";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";

// Filters for the list
const GROUPS = [
  ["all", "All"],
  ["upcoming", "Upcoming"],
  ["in_progress", "In progress"],
  ["completed", "Completed"],
  ["unpaid", "Unpaid"],
];
const SERVICE_FILTERS = [
  { value: "all", label: "All services" },
  { value: "house_cleaning", label: "House cleaning" },
  { value: "laundry", label: "Laundry" },
  { value: "move_out", label: "Moving" },
  { value: "repairs", label: "Repairs" },
  { value: "gardening", label: "Gardening" },
];
const inGroup = (b, group) => {
  switch (group) {
    case "unpaid":
      return b.payment_status === "pending";
    case "upcoming":
      return b.payment_status === "paid" && ["confirmed", "assigned", "accepted"].includes(b.status);
    case "in_progress":
      return b.status === "in_progress" || b.status === "completion_requested";
    case "completed":
      return b.status === "completed";
    default:
      return true;
  }
};

const STATUS_LABELS = { ...OWNER_STATUS_LABELS };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const getAuthToken = () => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("auth_token=")
    );
    if (authCookie) {
      return authCookie.split("=")[1];
    }
  }

  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem("auth_token") || localStorage.getItem("token");
  }
  return null;
};

// Unpaid booking: pick up where they left off, or find out if a payment already went through
function PaymentActions({ booking, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  if (booking.payment_status !== "pending" || !booking.payment_reference) return null;

  const check = async () => {
    setBusy(true);
    setNote("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/services/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: booking.payment_reference }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setNote("Payment confirmed.");
        onChanged();
      } else if (response.status === 409 || response.status >= 500 || response.status === 429) {
        setNote(data.message || "We couldn't check just now. Please try again in a moment.");
      } else {
        setNote("Paystack hasn't confirmed a payment for this booking yet. If you haven't paid, use Pay now.");
      }
    } catch {
      setNote("No connection. Check your internet and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <p className="text-sm text-gray-600 mb-3">Not paid yet? Finish paying, or check whether your payment already went through.</p>
      <div className="flex flex-wrap gap-2">
        {booking.payment_url && (
          <a href={booking.payment_url} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700">
            Pay now
          </a>
        )}
        <button onClick={check} disabled={busy} className="px-4 py-2 rounded-lg border border-brand-600 text-brand-700 text-sm font-semibold hover:bg-brand-50 disabled:opacity-60">
          {busy ? "Checking…" : "I've already paid, check"}
        </button>
      </div>
      {note && (
        <p role="status" className="mt-3 text-sm text-gray-700">
          {note}
        </p>
      )}
    </div>
  );
}

export default function BookingsDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clockOffset, setClockOffset] = useState(0);
  const [group, setGroup] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  // The chosen filters live in the address, so back/refresh/sharing keep them
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (GROUPS.some(([k]) => k === q.get("status"))) setGroup(q.get("status"));
    if (SERVICE_FILTERS.some((s) => s.value === q.get("service"))) setServiceFilter(q.get("service"));
  }, []);
  const choose = (nextGroup, nextService) => {
    setGroup(nextGroup);
    setServiceFilter(nextService);
    const q = new URLSearchParams();
    if (nextGroup !== "all") q.set("status", nextGroup);
    if (nextService !== "all") q.set("service", nextService);
    window.history.replaceState(null, "", q.toString() ? `?${q}` : window.location.pathname);
  };

  const fetchBookings = async (silent = false) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        router.push("/auth/signin");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/services/my-services`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const result = await response.json();
      if (result.data?.serverTime) setClockOffset(Date.parse(result.data.serverTime) - Date.now());
      // Map the backend's service records to the fields this page displays
      const services = result.data?.services || [];
      setBookings(
        services.map((s) => ({
          id: s.id,
          booking_id: s.service_id,
          service_type: s.serviceName || s.serviceType,
          booking_date: s.bookingDate,
          booking_time: s.bookingTime,
          location: s.location,
          amount: s.serviceRate, // naira
          status: s.status,
          payment_status: s.paymentStatus,
          service_key: s.serviceType,
          progress: s.progress,
          payment_reference: s.paymentReference,
          payment_url: s.paymentUrl,
          partner_name: s.partnerName,
          partner_phone: s.partnerPhone,
          owner_security: s.ownerSecurity,
        }))
      );
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (!silent) setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // While work is under way, check back so "completed" appears without a refresh
  useEffect(() => {
    if (!bookings.some((b) => b.status === "in_progress" || b.status === "completion_requested")) return;
    const timer = setInterval(() => fetchBookings(true), 20000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      assigned: "bg-blue-100 text-blue-800",
      accepted: "bg-brand-100 text-brand-700",
      in_progress: "bg-cyan-100 text-cyan-800",
      completion_requested: "bg-amber-100 text-amber-900",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || statusStyles.pending
        }`}
      >
        {STATUS_LABELS[status] || "Pending"}
      </span>
    );
  };

  const visible = bookings.filter((b) => inGroup(b, group) && (serviceFilter === "all" || b.service_key === serviceFilter));

  if (loading) {
    return (
      <PageLoader label="Loading your bookings" />
    );
  }

  return (
    <>
      <Head>
        <title>My Bookings | House Cleaning</title>
        <meta
          name="description"
          content="View and manage your cleaning service bookings"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <ServiceHeader
          tab={false}
          width="wide"
          title="My Bookings"
          subtitle="Your appointments and where each one stands."
          action={
            <button onClick={() => router.push("/")} className="h-11 px-5 rounded-full bg-brand-600 text-white text-[15px] font-semibold hover:bg-brand-700">
              Book a service
            </button>
          }
        />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't made any cleaning service bookings.
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Book Your First Service
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
                  {GROUPS.map(([key, label]) => {
                    const count = bookings.filter((b) => inGroup(b, key) && (serviceFilter === "all" || b.service_key === serviceFilter)).length;
                    const on = group === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={on}
                        onClick={() => choose(key, serviceFilter)}
                        className={`h-10 rounded-full px-4 text-[14px] font-semibold transition-colors ${on ? "bg-brand-600 text-white" : "bg-white text-brand-900 ring-1 ring-inset ring-brand-900/15 hover:bg-brand-50"}`}
                      >
                        {label} <span className={`ml-1 tabular-nums ${on ? "text-white/80" : "text-brand-900/50"}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
                <Select
                  className="sm:w-56"
                  value={serviceFilter}
                  onChange={(v) => choose(group, v)}
                  options={SERVICE_FILTERS}
                  title="Service"
                  triggerClassName="h-10 w-full rounded-full bg-white px-4 text-[14px] font-semibold text-brand-900 ring-1 ring-inset ring-brand-900/15 outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                />
              </div>

              {visible.length === 0 ? (
                <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                  <p className="text-[17px] font-semibold text-gray-900">No bookings match these filters.</p>
                  <button type="button" onClick={() => choose("all", "all")} className="mt-3 text-[15px] font-semibold text-brand-700 underline underline-offset-4">
                    Clear filters
                  </button>
                </div>
              ) : (
            <div className="space-y-6">
              {visible.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.service_type || "House Cleaning"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Booking ID: {booking.booking_id || booking.id}
                      </p>
                    </div>
                    {booking.status && getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Date & Time
                      </h4>
                      <p className="text-gray-900">
                        {booking.booking_date
                          ? new Date(booking.booking_date).toLocaleDateString()
                          : "TBD"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.booking_time || "Time TBD"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Location
                      </h4>
                      <p className="text-gray-900">
                        {booking.location || "Address TBD"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </h4>
                      <p className="text-xl font-bold text-brand-600">
                        ₦{booking.amount?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-sm">
                    <span className="text-gray-600">Your team: </span>
                    {booking.partner_name ? (
                      <span className="font-semibold text-gray-900">
                        {booking.partner_name}
                        {booking.partner_phone && ` · ${booking.partner_phone}`}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {booking.payment_status === "paid"
                          ? "We're assigning your Kliner team"
                          : "Assigned after payment"}
                      </span>
                    )}
                  </div>

                  {booking.payment_status && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Payment Status:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.payment_status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.payment_status?.charAt(0).toUpperCase() +
                            booking.payment_status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {booking.payment_status === "paid" && booking.owner_security && (
                    <div className="mt-4 pt-4 border-t">
                      <OwnerSafetyTimeline security={booking.owner_security} />
                    </div>
                  )}

                  {["in_progress", "completion_requested"].includes(booking.status) && booking.progress?.startedAt && (
                    <div className="mt-4 pt-4 border-t">
                      <JobProgress startedAt={booking.progress.startedAt} expectedMinutes={booking.progress.expectedMinutes} clockOffset={clockOffset} />
                    </div>
                  )}
                  <PaymentActions booking={booking} onChanged={() => fetchBookings(true)} />
                </div>
              ))}
            </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
