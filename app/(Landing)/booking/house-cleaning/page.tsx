// pages/house-cleaning.js
"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import DateTimeSelector from "../../../components/DateTimeSelector";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// Get auth token from cookies or localStorage
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

// Get user data from localStorage
const getUserData = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new Error("localStorage not available");
  }

  const userData = localStorage.getItem("user_data");
  if (!userData) {
    throw new Error("User not found. Please log in again.");
  }

  try {
    const user = JSON.parse(userData);
    const userId = user.user_id || user.id;

    if (!userId) {
      throw new Error("Invalid user data. Please log in again.");
    }

    return { user, userId };
  } catch (parseError) {
    throw new Error("Invalid user data. Please log in again.");
  }
};

// Map frontend room names to backend format
const mapRoomsToBackend = (frontendItems: { [key: string]: number }) => {
  const roomMapping = {
    "Living Room": "Living Room",
    Terrace: "Terrace/Balcony",
    Bedroom: "Bedrooms",
    Bathroom: "Bathrooms",
    Kitchen: "Kitchen",
    Dining: "Dining Room",
    Garage: "Garage",
  };

  const backendItems = {
    "Living Room": 0,
    Bedrooms: 0,
    Bathrooms: 0,
    Kitchen: 0,
    "Dining Room": 0,
    "Terrace/Balcony": 0,
    Garage: 0,
    "Study/Office": 0,
  };

  Object.keys(frontendItems).forEach((frontendKey) => {
    const backendKey = roomMapping[frontendKey];
    if (backendKey && backendItems.hasOwnProperty(backendKey)) {
      backendItems[backendKey] = frontendItems[frontendKey];
    }
  });

  return backendItems;
};

interface CleaningPriceOptions {
  category?: string;
  package?: string;
  homeSize?: string;
  frequency?: string;
}

// Calculate price client-side (matches backend logic)
const calculateCleaningPrice = (
  items: { [key: string]: number },
  options: CleaningPriceOptions = {}
) => {
  const {
    category = "Standard Cleaning",
    package: packageName = "Standard Package",
    homeSize = "small",
    frequency = "one-time",
  } = options;

  // Pricing constants (matches backend)
  const CLEANING_CATEGORIES = {
    "Standard Cleaning": { basePrice: 8000, pricePerRoom: 1200 },
    "Deep Cleaning": { basePrice: 15000, pricePerRoom: 2000 },
    "Move-in Cleaning": { basePrice: 20000, pricePerRoom: 2500 },
    "Move-out Cleaning": { basePrice: 22000, pricePerRoom: 2800 },
  };

  const CLEANING_PACKAGES = {
    "Basic Package": { multiplier: 0.8 },
    "Standard Package": { multiplier: 1 },
    "Premium Package": { multiplier: 1.4 },
    "Luxury Package": { multiplier: 1.8 },
  };

  const HOME_SIZES = {
    studio: { multiplier: 0.7 },
    small: { multiplier: 1 },
    medium: { multiplier: 1.5 },
    large: { multiplier: 2.2 },
  };

  const FREQUENCIES = {
    "one-time": { discount: 0 },
    monthly: { discount: 0.05 },
    "bi-weekly": { discount: 0.1 },
    weekly: { discount: 0.15 },
  };

  const categoryData = CLEANING_CATEGORIES[category];
  const packageData = CLEANING_PACKAGES[packageName];
  const sizeData = HOME_SIZES[homeSize];
  const frequencyData = FREQUENCIES[frequency];

  if (!categoryData || !packageData || !sizeData || !frequencyData) {
    return { finalPrice: 0, breakdown: {} };
  }

  // Convert frontend items to backend format for calculation
  const backendItems = mapRoomsToBackend(items);
  const totalItems = Object.values(backendItems).reduce(
    (sum, count) => sum + Number(count),
    0
  );

  if (totalItems === 0) {
    return { finalPrice: 0, breakdown: {} };
  }

  // Calculate price
  const baseTotal =
    (categoryData.basePrice + totalItems * categoryData.pricePerRoom) *
    packageData.multiplier *
    sizeData.multiplier;

  const discountedPrice = baseTotal * (1 - frequencyData.discount);
  const finalPrice = Math.round(discountedPrice);

  return {
    finalPrice,
    breakdown: {
      basePrice: categoryData.basePrice,
      roomCount: totalItems,
      pricePerRoom: categoryData.pricePerRoom,
      packageMultiplier: packageData.multiplier,
      sizeMultiplier: sizeData.multiplier,
      frequencyDiscount: frequencyData.discount,
      subtotal: baseTotal,
      discount: baseTotal - discountedPrice,
      total: finalPrice,
    },
  };
};

interface CustomerInfoState {
  phone: string;
  address: string;
  notes: string;
  specialRequests: string[];
  reminders: {
    sms: boolean;
    email: boolean;
  };
}

export default function HouseCleaningPage() {
  const router = useRouter();
  const [items, setItems] = useState({
    "Living Room": 0,
    Terrace: 0,
    Bedroom: 0,
    Bathroom: 0,
    Kitchen: 0,
    Dining: 0,
    Garage: 0,
  });

  const [selectedOptions, setSelectedOptions] = useState({
    category: "Standard Cleaning",
    package: "Standard Package",
    homeSize: "small",
    frequency: "one-time",
    preferredTime: "10:00 AM - 12:00 PM",
    specialInstructions: "",
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerInfoState>({
    phone: "",
    address: "",
    notes: "",
    specialRequests: [],
    reminders: {
      sms: false,
      email: false,
    },
  });

  const [totalItems, setTotalItems] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);
  const [pricing, setPricing] = useState({ finalPrice: 0, breakdown: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  // Service options
  const categories = [
    { id: "Standard Cleaning", name: "Standard Cleaning", icon: "🧹" },
    { id: "Deep Cleaning", name: "Deep Cleaning", icon: "✨" },
    { id: "Move-in Cleaning", name: "Move-in Cleaning", icon: "📦" },
    { id: "Move-out Cleaning", name: "Move-out Cleaning", icon: "🏠" },
  ];

  const packages = [
    {
      id: "Basic Package",
      name: "Basic Package",
      description: "Essential cleaning",
    },
    {
      id: "Standard Package",
      name: "Standard Package",
      description: "Complete cleaning",
    },
    {
      id: "Premium Package",
      name: "Premium Package",
      description: "Detailed cleaning",
    },
    {
      id: "Luxury Package",
      name: "Luxury Package",
      description: "White-glove service",
    },
  ];

  const homeSizes = [
    { id: "studio", name: "Studio/1BR", description: "Up to 1 bedroom" },
    { id: "small", name: "2-3 Bedrooms", description: "Small to medium home" },
    { id: "medium", name: "4-5 Bedrooms", description: "Large family home" },
    { id: "large", name: "5+ Bedrooms", description: "Very large property" },
  ];

  const frequencies = [
    { id: "one-time", name: "One-time", discount: 0 },
    { id: "monthly", name: "Monthly", discount: 5 },
    { id: "bi-weekly", name: "Bi-weekly", discount: 10 },
    { id: "weekly", name: "Weekly", discount: 15 },
  ];

  // Calculate total items whenever items state changes
  useEffect(() => {
    const total = Object.values(items).reduce((sum, count) => sum + count, 0);
    setTotalItems(total);
  }, [items]);

  // Calculate pricing when items or options change
  useEffect(() => {
    const newPricing = calculateCleaningPrice(items, selectedOptions);
    setPricing(newPricing);
  }, [items, selectedOptions]);

  // Detect if viewing on desktop
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleIncrement = (item: string) => {
    setItems((prev) => ({
      ...prev,
      [item]: prev[item] + 1,
    }));
  };

  const handleDecrement = (item: string) => {
    if (items[item] > 0) {
      setItems((prev) => ({
        ...prev,
        [item]: prev[item] - 1,
      }));
    }
  };

  const handleOptionChange = (key: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCustomerInfoChange = (key: string, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSpecialRequestChange = (requestId: string, isChecked: boolean) => {
    setCustomerInfo((prev) => {
      const currentRequests = prev.specialRequests;
      if (isChecked) {
        return {
          ...prev,
          specialRequests: [...currentRequests, requestId],
        };
      } else {
        return {
          ...prev,
          specialRequests: currentRequests.filter((id) => id !== requestId),
        };
      }
    });
  };

  const handleReminderChange = (type: "sms" | "email", isChecked: boolean) => {
    setCustomerInfo((prev) => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        [type]: isChecked,
      },
    }));
  };

  // Book cleaning service API call
  const bookCleaningService = async (
    cleaningData,
    bookingDetails,
    customerInfo = {}
  ) => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("Authentication required. Please log in again.");
      }

      const { userId } = getUserData();

      const requestData = {
        user_id: userId,
        cleaningData,
        bookingDetails,
        customerInfo,
      };

      console.log("🏠 Booking cleaning service with data:", requestData);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/house-cleaning/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Booking failed: ${response.status}`
        );
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error booking cleaning service:", error);
      throw error;
    }
  };

  const handleContinue = () => {
    if (totalItems === 0) {
      setError("Please select at least one room to clean");
      return;
    }

    // Clear any previous errors
    setError(null);

    // Transform data for API
    const backendItems = mapRoomsToBackend(items);

    const cleaningData = {
      category: selectedOptions.category,
      package: selectedOptions.package,
      items: backendItems,
      homeSize: selectedOptions.homeSize,
      frequency: selectedOptions.frequency,
      estimatedPrice: pricing.finalPrice,
      estimatedTime: getEstimatedTime(),
      preferredTime: selectedOptions.preferredTime,
      specialInstructions: selectedOptions.specialInstructions,
      turnaround: getTurnaround(selectedOptions.category),
    };

    // Store booking data for DateTimeSelector
    const bookingData = {
      items,
      selectedOptions,
      pricing,
      totalItems,
      cleaningData,
      backendItems,
      customerInfo,
    };

    localStorage.setItem("cleaningItems", JSON.stringify(bookingData));
    setIsDateSelectorOpen(true);
  };

  // Get turnaround time by category
  const getTurnaround = (category: string) => {
    const turnarounds = {
      "Standard Cleaning": "2-4 hours",
      "Deep Cleaning": "4-6 hours",
      "Move-in Cleaning": "5-8 hours",
      "Move-out Cleaning": "5-8 hours",
    };
    return turnarounds[category] || "2-4 hours";
  };

  // Calculate estimated time based on total items
  const getEstimatedTime = () => {
    const baseTime = 60; // 60 minutes base time
    const timePerItem = 30; // 30 minutes per item
    const totalMinutes = baseTime + totalItems * timePerItem;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  };

  // Get room icon based on room name
  const getRoomIcon = (roomName: string) => {
    const icons = {
      "Living Room": (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      Bedroom: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-9 3h4"
          />
        </svg>
      ),
      Bathroom: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      Kitchen: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 9.5L3 14.5M12 21.5V4.5M21 9.5V14.5M12 4.5C10.8954 4.5 10 5.39543 10 6.5V8.5C10 9.60457 10.8954 10.5 12 10.5C13.1046 10.5 14 9.60457 14 8.5V6.5C14 5.39543 13.1046 4.5 12 4.5Z"
          />
        </svg>
      ),
      default: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    };
    return icons[roomName] || icons.default;
  };

  return (
    <>
      <Head>
        <title>House Cleaning | Home Services</title>
        <meta name="description" content="Book our house cleaning service" />
      </Head>

      {/* Enhanced DateTimeSelector with booking functionality */}
      <DateTimeSelector
        isOpen={isDateSelectorOpen}
        onClose={() => setIsDateSelectorOpen(false)}
        selectedItems={items}
        bookingService={bookCleaningService}
        pricing={pricing}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Top service info banner */}
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white p-3 text-center">
          <p className="text-sm">Professional Cleaning Services</p>
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white p-4 flex items-center border-b shadow-sm">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-all"
            aria-label="Go back"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">House Cleaning</h1>
            <p className="text-sm text-gray-500 hidden md:block">
              Customize your cleaning service
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Service Options Toggle */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Service Options
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedOptions.category} • {selectedOptions.package} •{" "}
                  {
                    homeSizes.find((s) => s.id === selectedOptions.homeSize)
                      ?.name
                  }
                </p>
              </div>
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  showOptions ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showOptions && (
              <div className="mt-6 space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Cleaning Type
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          handleOptionChange("category", category.id)
                        }
                        className={`p-3 rounded-lg border-2 text-left ${
                          selectedOptions.category === category.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <span className="text-lg mr-2">{category.icon}</span>
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Packages */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Package
                  </h4>
                  <div className="space-y-2">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => handleOptionChange("package", pkg.id)}
                        className={`w-full p-3 rounded-lg border-2 text-left ${
                          selectedOptions.package === pkg.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="font-medium text-sm">{pkg.name}</div>
                        <div className="text-xs text-gray-500">
                          {pkg.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Home Size & Frequency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Home Size
                    </h4>
                    <select
                      value={selectedOptions.homeSize}
                      onChange={(e) =>
                        handleOptionChange("homeSize", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {homeSizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Frequency
                    </h4>
                    <select
                      value={selectedOptions.frequency}
                      onChange={(e) =>
                        handleOptionChange("frequency", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {frequencies.map((freq) => (
                        <option key={freq.id} value={freq.id}>
                          {freq.name}{" "}
                          {freq.discount > 0 && `(-${freq.discount}%)`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Room Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Customize Your Cleaning
                </h2>
                <p className="text-sm text-gray-500">
                  Select the areas you want cleaned
                </p>
              </div>
            </div>

            {/* Progress and pricing */}
            <div className="flex justify-between items-center mb-6">
              <div className="w-1/2">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Cleaning Scope
                </p>
                <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${Math.min(totalItems * 10, 100)}%` }}
                  />
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Estimated Price</p>
                <p className="text-xl font-bold text-purple-600">
                  ₦{pricing.finalPrice.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{getEstimatedTime()}</p>
              </div>
            </div>

            {/* Room selectors */}
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {Object.keys(items).map((item) => (
                <div
                  key={item}
                  className={`bg-white border-2 p-4 rounded-xl flex items-center justify-between transition-all duration-200 ${
                    items[item] > 0
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        items[item] > 0
                          ? "bg-purple-200 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getRoomIcon(item)}
                    </div>
                    <span className="text-base font-medium text-gray-900">
                      {item}
                    </span>
                  </div>
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                    <button
                      onClick={() => handleDecrement(item)}
                      className={`w-9 h-9 flex items-center justify-center rounded-l-lg ${
                        items[item] > 0
                          ? "text-purple-600 hover:bg-gray-100"
                          : "text-gray-300"
                      }`}
                      disabled={items[item] === 0}
                      aria-label={`Decrease ${item}`}
                    >
                      <span className="text-xl">−</span>
                    </button>
                    <span className="w-9 text-center font-semibold text-gray-900">
                      {items[item]}
                    </span>
                    <button
                      onClick={() => handleIncrement(item)}
                      className="w-9 h-9 flex items-center justify-center rounded-r-lg text-purple-600 hover:bg-gray-100"
                      aria-label={`Increase ${item}`}
                    >
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Service features */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Included in every cleaning:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Professional equipment & supplies",
                  "Trained and vetted cleaners",
                  "Thorough dusting & wiping",
                  "Floor cleaning & mopping",
                  "Bathroom cleaning & sanitizing",
                  "Kitchen cleaning & countertop cleaning",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Information Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Service Details
                </h2>
                <p className="text-sm text-gray-500">
                  Provide additional information for your cleaning service
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={selectedOptions.specialInstructions}
                  onChange={(e) =>
                    handleOptionChange("specialInstructions", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Any special requests, areas that need extra attention, or specific cleaning preferences..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Let us know about pets, allergies, delicate items, or specific
                  cleaning requirements
                </p>
              </div>

              {/* Customer Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      handleCustomerInfoChange("phone", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+234-xxx-xxx-xxxx"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll use this to coordinate with you on the day of cleaning
                  </p>
                </div>

                {/* Service Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Address
                  </label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) =>
                      handleCustomerInfoChange("address", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Full address where cleaning will take place"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include apartment/unit number if applicable
                  </p>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={customerInfo.notes}
                  onChange={(e) =>
                    handleCustomerInfoChange("notes", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Access instructions, parking information, or any other details our team should know..."
                />
              </div>

              {/* Special Requests Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Special Requests (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: "eco-friendly", label: "Eco-friendly products only" },
                    { id: "pet-safe", label: "Pet-safe cleaning products" },
                    { id: "fragrance-free", label: "Fragrance-free products" },
                    {
                      id: "inside-appliances",
                      label: "Clean inside appliances",
                    },
                    { id: "windows", label: "Clean interior windows" },
                    { id: "organization", label: "Light organization help" },
                  ].map((request) => (
                    <label key={request.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={customerInfo.specialRequests.includes(
                          request.id
                        )}
                        onChange={(e) =>
                          handleSpecialRequestChange(
                            request.id,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {request.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact Preferences */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Service Reminders
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customerInfo.reminders?.sms || false}
                      onChange={(e) =>
                        handleReminderChange("sms", e.target.checked)
                      }
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Send SMS reminders before service
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customerInfo.reminders?.email || false}
                      onChange={(e) =>
                        handleReminderChange("email", e.target.checked)
                      }
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Send email confirmations and updates
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Summary & Continue */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Cleaning Summary
                </h3>
                <p className="text-sm text-gray-500">
                  {totalItems} {totalItems === 1 ? "area" : "areas"} •{" "}
                  {selectedOptions.category}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">
                  ₦{pricing.finalPrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">{getEstimatedTime()}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={totalItems === 0 || loading}
              className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
                totalItems > 0 && !loading
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading
                ? "Processing..."
                : totalItems === 0
                ? "Select rooms to continue"
                : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
