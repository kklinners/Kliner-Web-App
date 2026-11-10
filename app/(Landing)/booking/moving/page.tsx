// pages/move-out.js
"use client";

import ServiceHeader from "../../../components/ServiceHeader";
import { ROOM_ICONS } from "../../../components/icons/KlinIcons";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MoveOutPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState({
    "Living Room": 0,
    Terrace: 0,
    Bedroom: 0,
    Bathroom: 0,
    Kitchen: 0,
    "Dining Room": 0,
    Garage: 0,
  });
  const [totalRooms, setTotalRooms] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Calculate total rooms whenever rooms state changes
  useEffect(() => {
    const total = Object.values(rooms).reduce((sum, count) => sum + count, 0);
    setTotalRooms(total);
  }, [rooms]);

  // Detect if viewing on desktop
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleIncrement = (room) => {
    setRooms((prev) => ({
      ...prev,
      [room]: prev[room] + 1,
    }));
  };

  const handleDecrement = (room) => {
    if (rooms[room] > 0) {
      setRooms((prev) => ({
        ...prev,
        [room]: prev[room] - 1,
      }));
    }
  };

  const handleContinue = () => {
    localStorage.setItem("moveOutRooms", JSON.stringify(rooms));
    const roomList = Object.entries(rooms)
      .filter(([, n]) => Number(n) > 0)
      .map(([room, n]) => `${room} × ${n}`)
      .join(", ");
    localStorage.setItem(
      "pendingBooking",
      JSON.stringify({
        serviceType: "move_out",
        serviceName: "Moving Service",
        serviceCategory: "Home Moving",
        serviceData: { category: "Home Moving", rooms },
        details: [
          { label: "Rooms", value: roomList },
          { label: "Total rooms", value: String(totalRooms) },
        ],
      })
    );
    localStorage.removeItem("bookingSchedule");

    // Navigate to the next step
    router.push("/booking-summary");
  };

  // Get room icon based on room name
  const getRoomIcon = (roomName: string) => {
    const Icon = ROOM_ICONS[roomName];
    return Icon ? <Icon size={34} /> : null;
  };

  return (
    <>
      <Head>
        <title>Move-out/in Package | Home Services</title>
        <meta
          name="description"
          content="Book our move-out/in cleaning service"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <ServiceHeader title="Moving" subtitle="Tell us how many rooms we're moving" width="narrow" />

        <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <p className="text-lg font-medium mb-2 text-gray-900">
              Enter the number of rooms to be cleared
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Select the quantity for each room type in your home.
            </p>

            {/* Progress indicator */}
            <div className="mb-6 bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-300"
                style={{ width: `${Math.min(totalRooms * 10, 100)}%` }}
              ></div>
            </div>

            {/* Room selectors */}
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {Object.keys(rooms).map((room) => (
                <div
                  key={room}
                  className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:border-brand-300 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 flex items-center justify-center mr-3 shrink-0">
                      {getRoomIcon(room)}
                    </div>
                    <span className="text-base font-medium text-gray-900">
                      {room}
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100">
                    <button
                      onClick={() => handleDecrement(room)}
                      className={`w-10 h-10 flex items-center justify-center rounded-l-lg ${
                        rooms[room] > 0
                          ? "text-brand-600 hover:bg-gray-100"
                          : "text-gray-300"
                      }`}
                      disabled={rooms[room] === 0}
                      aria-label={`Decrease ${room}`}
                    >
                      <span className="text-xl">−</span>
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-900">
                      {rooms[room]}
                    </span>
                    <button
                      onClick={() => handleIncrement(room)}
                      className="w-10 h-10 flex items-center justify-center rounded-r-lg text-brand-600 hover:bg-gray-100"
                      aria-label={`Increase ${room}`}
                    >
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected room count */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                <span className="font-semibold text-brand-600 text-xl">
                  {totalRooms}
                </span>
                <span className="ml-1 text-gray-700">rooms selected</span>
              </p>
            </div>
          </div>

          {/* Continue button */}
          <div
            className={
              isDesktop
                ? "mt-6"
                : "fixed bottom-0 left-0 right-0 p-4 bg-white border-t"
            }
          >
            <button
              onClick={handleContinue}
              className={`w-full py-4 bg-brand-600 text-white rounded-xl text-lg font-medium shadow-lg hover:bg-brand-700 transition-all duration-300 ${
                totalRooms === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={totalRooms === 0}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
