// components/DateTimeSelector.js
"use client";

import KlinerLoader from "./KlinerLoader";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SERVICE_AREAS, LAUNCH_DISTRICT } from "../../utils/serviceAreas";
import Select from "./Select";

// onSubmit(schedule) is optional: when given, the parent handles the schedule
// (e.g. the summary page); otherwise it is saved and we go to /booking-summary.
export default function DateTimeSelector({
  isOpen,
  onClose,
  onSubmit = null,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: ((schedule: { bookingDate: string; bookingTime: string; location: string; area: string }) => void) | null;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [location, setLocation] = useState(""); // street address
  const [area, setArea] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Generate time slots from 8 AM to 8 PM
  useEffect(() => {
    const times = [];
    for (let hour = 8; hour <= 20; hour++) {
      const hourString = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
      const timeValue = hour < 10 ? `0${hour}:00` : `${hour}:00`;
      times.push({ label: hourString, value: timeValue });
    }
    setAvailableTimes(times);
  }, []);

  // Handle outside click to close modal
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && e.target.classList.contains("modal-backdrop")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();

    // Calculate days from previous month to display
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 0 : firstDayOfWeek;

    const days = [];

    // Add empty slots for days from previous month
    for (let i = 0; i < daysFromPrevMonth; i++) {
      days.push({ day: null, date: null });
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const today = new Date();

      // Check if date is in the past
      const isPast = date < new Date(today.setHours(0, 0, 0, 0));

      days.push({
        day,
        date,
        isPast,
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const selectDate = (date) => {
    if (date && !date.isPast) {
      setSelectedDate(date.date);
    }
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !location.trim() || !area) {
      return; // Validate required fields
    }

    setIsLoading(true);

    const schedule = {
      bookingDate: selectedDate.toISOString(),
      bookingTime: selectedTime,
      location: `${location.trim()}, ${area}, ${LAUNCH_DISTRICT}, Lagos`,
      area,
    };

    if (onSubmit) {
      setIsLoading(false);
      onSubmit(schedule);
      return;
    }

    localStorage.setItem("bookingSchedule", JSON.stringify(schedule));
    router.push("/booking-summary");
  };

  if (!isOpen) return null;

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Schedule Cleaning
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Calendar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Previous month"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h3 className="text-lg font-medium text-gray-900">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Next month"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day, index) => (
                <div
                  key={index}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    text-center p-2 rounded-full h-10 w-10 mx-auto flex items-center justify-center
                    ${!day.day ? "invisible" : ""}
                    ${
                      day.isPast
                        ? "text-gray-300 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                    ${day.isToday ? "border border-brand-400" : ""}
                    ${
                      selectedDate &&
                      day.date &&
                      selectedDate.getDate() === day.date.getDate() &&
                      selectedDate.getMonth() === day.date.getMonth() &&
                      selectedDate.getFullYear() === day.date.getFullYear()
                        ? "bg-brand-600 text-white"
                        : day.isPast
                        ? ""
                        : "hover:bg-brand-100"
                    }
                  `}
                  onClick={() => selectDate(day)}
                >
                  {day.day}
                </div>
              ))}
            </div>
          </div>

          {/* Time selection */}
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-3">
              Select Time
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time, index) => (
                <button
                  key={index}
                  className={`
                    py-2 px-3 rounded-lg text-sm border
                    ${
                      selectedTime === time.value
                        ? "bg-brand-600 text-white border-brand-600"
                        : "border-gray-200 text-gray-700 hover:border-brand-400"
                    }
                  `}
                  onClick={() => setSelectedTime(time.value)}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location input */}
          <div className="mb-6">
            <label
              htmlFor="area"
              className="block text-base font-medium text-gray-900 mb-1"
            >
              Area in {LAUNCH_DISTRICT}
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Kliner is currently live in {LAUNCH_DISTRICT} only. More areas coming soon.
            </p>
            <Select
              id="area"
              className="mb-3"
              value={area}
              onChange={setArea}
              options={SERVICE_AREAS}
              placeholder="Select your area"
              title={`Area in ${LAUNCH_DISTRICT}`}
              triggerClassName="w-full h-[50px] px-3 border border-gray-300 rounded-lg bg-white text-black text-[16px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            />
            <label
              htmlFor="location"
              className="block text-base font-medium text-gray-900 mb-2"
            >
              Street address
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 12 Diya Street"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || !location.trim() || !area || isLoading}
            className={`
              w-full py-4 rounded-xl text-white font-medium text-lg
              ${
                !selectedDate || !selectedTime || !location.trim() || !area || isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-brand-600 hover:bg-brand-700 shadow-lg"
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <KlinerLoader size={24} className="mr-3" />
                Processing...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
