"use client";
import UserHeader from "./UserHeader";
import SearchBar from "./SearchBar";
import SpecialOffers from "./SpecialOffers";
import ServiceCategories from "./ServiceCategories";
import BottomNavigation from "./BottomNavigation";
import DesktopSidebar from "./DesktopSidebar";
import ProgressBar from "./ProgressBar";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation"; // Import router
import { VENDORS_ENABLED } from "../../utils/features";

export default function CustomerHome() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter(); // Initialize router

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
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // If not authenticated, don't render the page content
  // This prevents flash of content before redirect happens
  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Redirecting to login...
      </div>
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

              {/* Special Offers Section */}
              <div className="px-4 mb-6">
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

            {/* Desktop Sidebar - Only visible on lg+ screens */}
            <div className="lg:col-span-3">
              <DesktopSidebar />
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </main>
    </div>
  );
}
