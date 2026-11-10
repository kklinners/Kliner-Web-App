"use client";
import { PageLoader } from "./KlinerLoader";
import UserHeader from "./UserHeader";
import SearchBar from "./SearchBar";
import SpecialOffers from "./SpecialOffers";
import ServiceCategories from "./ServiceCategories";
import BottomNavigation from "./BottomNavigation";
import UpcomingBookings from "./UpcomingBookings";
import { PRE_ARRIVAL_NOTICE } from "../../utils/ownerSafety";
import ProgressBar from "./ProgressBar";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation"; // Import router
import { httpClient } from "../../utils/httpClient";
import { VENDORS_ENABLED } from "../../utils/features";

export default function CustomerHome() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter(); // Initialize router

  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [clockOffset, setClockOffset] = useState(0);

  // The customer's real upcoming bookings (paid, from today onwards). While one is being worked
  // on, check again every 30 seconds so its progress and completion stay current.
  useEffect(() => {
    if (loading || !isAuthenticated()) return;
    let timer;
    const load = () =>
      httpClient
      .get("/api/v1/services/my-services")
      .then(({ data }) => {
        if (data.data?.serverTime) setClockOffset(Date.parse(data.data.serverTime) - Date.now());
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const live = ["confirmed", "assigned", "accepted", "in_progress", "completion_requested"];
        setUpcoming(
          (data.data?.services || [])
            .filter((s) => live.includes(s.status) && new Date(s.bookingDate).getTime() >= startOfToday)
            .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
            .slice(0, 3)
        );
      })
      .catch(() => {});
    load();
    timer = setInterval(() => load(), 30000);
    return () => clearInterval(timer);
  }, [loading, isAuthenticated]);

  useEffect(() => {
    // If authentication check completed and user is not authenticated
    if (!loading && !isAuthenticated()) {
      // Redirect to login page
      router.push("/auth/signin");
    }
  }, [loading, isAuthenticated, router]);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <PageLoader />
    );
  }

  // If not authenticated, don't render the page content
  // This prevents flash of content before redirect happens
  if (!isAuthenticated()) {
    return (
      <PageLoader />
    );
  }

  // Only render the page content if authenticated
  return (
    <div className="bg-gray-50 min-h-screen relative">
      <main className="mx-auto bg-white min-h-screen shadow-lg pb-16 lg:pl-56">
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:px-8">
          {/* User Header with dynamic user name */}
          <UserHeader name={user ? user.firstName || user.name : "Guest"} />

          <div className="lg:grid lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-9">
              {/* Desktop Progress Bar - Only visible on lg+ screens */}
              <div className="px-4 my-4 hidden lg:block">
                <ProgressBar />
              </div>

              {/* Search Bar */}
              <div className="px-4 my-4">
                <SearchBar />
              </div>

              {upcoming.some((b) => {
                const day = new Date(b.bookingDate);
                const today = new Date();
                return (
                  b.ownerSecurity?.teamLeadName &&
                  day.toDateString() === today.toDateString() &&
                  ["accepted", "in_progress"].includes(b.status)
                );
              }) && (
                <div className="mx-4 mb-4 rounded-2xl bg-brand-100 border border-brand-200 px-4 py-3 text-[14px] text-brand-950">
                  {PRE_ARRIVAL_NOTICE}
                </div>
              )}

              {/* Next bookings: right under the search on phones, in the side column on desktop */}
              <div className="px-4 mb-6 lg:hidden">
                <UpcomingBookings bookings={upcoming} clockOffset={clockOffset} />
              </div>

              {/* Special Offers, set by the admin */}
              <div className="px-4 mb-6 empty:hidden">
                <SpecialOffers />
              </div>

              {/* Service Categories - Component handles mobile/desktop display internally */}
              <div className={`px-4 ${VENDORS_ENABLED ? "mb-6" : "mb-24 lg:mb-6"}`}>
                <ServiceCategories />
              </div>

              {/* Partner recruitment */}
              {VENDORS_ENABLED && (
              <div className="px-4 mb-24 lg:mb-6">
                <a
                  href="/partners"
                  className="flex items-center justify-between gap-4 bg-brand-50 border border-brand-100 rounded-2xl p-4 hover:bg-brand-100 transition-colors"
                >
                  <div>
                    <p className="font-bold text-brand-900">Own a cleaning company in Gbagada?</p>
                    <p className="text-sm text-gray-600">Join Kliner as a verified partner and get paid jobs near you.</p>
                  </div>
                  <span className="shrink-0 bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                    Apply
                  </span>
                </a>
              </div>
              )}
            </div>

            {/* Side column on desktop */}
            <div className="hidden lg:block lg:col-span-3">
              <UpcomingBookings bookings={upcoming} showEmpty clockOffset={clockOffset} />
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </main>
    </div>
  );
}
