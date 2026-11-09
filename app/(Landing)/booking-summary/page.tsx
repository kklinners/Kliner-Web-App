"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Cookies from "js-cookie";
import DateTimeSelector from "../../components/DateTimeSelector";
import { calculatePrice, formatNaira } from "../../../utils/pricing";

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
  const [error, setError] = useState("");

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
      <div className="min-h-screen text-black flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your booking details...</p>
        </div>
      </div>
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

  const handleConfirmBooking = async () => {
    setError("");
    if (!schedule) {
      setIsSchedulerOpen(true);
      return;
    }

    const authToken = Cookies.get("auth_token");
    const userId = readJSON("user_data")?.user_id;
    if (!authToken || !userId) {
      setError("Please log in again to complete your booking.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/services/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          user_id: userId,
          serviceType: booking.serviceType,
          serviceData: { ...booking.serviceData, estimatedPrice: price.total },
          bookingDetails: schedule,
          customerInfo: booking.customerInfo || {},
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Booking failed (${response.status})`);
      }

      const { authorization_url, reference, amount_naira } = data.data.payment;

      // Saved for the confirmation page
      localStorage.setItem(
        "bookingData",
        JSON.stringify({
          id: data.data.service?._id,
          serviceName: booking.serviceName,
          serviceCategory: booking.serviceCategory,
          details: booking.details,
          ...schedule,
          amount: amount_naira,
          paymentStatus: "pending",
          paymentReference: reference,
        })
      );

      window.location.href = authorization_url;
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.message || "Booking failed. Please try again.");
      setSubmitting(false);
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
        <div className="bg-gradient-to-r from-brand-700 to-brand-900 text-white p-3 text-center">
          <p className="text-sm">{booking.serviceName}</p>
        </div>

        <div className="sticky top-0 z-10 bg-white p-4 flex items-center border-b shadow-sm">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-800 hover:bg-gray-100 p-2 rounded-full"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Summary</h1>
            <p className="text-sm text-gray-500 hidden md:block">Review your booking before you pay</p>
          </div>
        </div>

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
