// pages/gardening.js
"use client";

import ServiceHeader from "../../../components/ServiceHeader";
import { LawnMowerIcon, HedgeIcon, WeedingIcon, PlantingIcon, PruningIcon, LeafRakeIcon, GardeningIcon, PlotIcon, CalendarIcon, ShieldCheckIcon } from "../../../components/icons/KlinIcons";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function GardeningPage() {
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState([]);
  const [gardenSize, setGardenSize] = useState(null);
  const [frequency, setFrequency] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

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

  const gardenServices = [
    {
      id: "lawn-mowing",
      title: "Lawn Mowing",
      description:
        "Regular cutting of grass to maintain a healthy and neat appearance",
      Icon: LawnMowerIcon,
    },
    {
      id: "hedge-trimming",
      title: "Hedge Trimming",
      description:
        "Precise cutting of hedges and bushes to maintain shape and promote healthy growth",
      Icon: HedgeIcon,
    },
    {
      id: "weeding",
      title: "Weeding",
      description:
        "Removal of unwanted plants from garden beds, lawns, and paved areas",
      Icon: WeedingIcon,
    },
    {
      id: "planting",
      title: "Planting",
      description:
        "Adding new plants, flowers, or trees to enhance your garden's beauty",
      Icon: PlantingIcon,
    },
    {
      id: "pruning",
      title: "Pruning",
      description:
        "Selective removal of branches to improve plant health and appearance",
      Icon: PruningIcon,
    },
    {
      id: "leaf-removal",
      title: "Leaf Removal",
      description: "Clearing fallen leaves to maintain a tidy garden and lawn",
      Icon: LeafRakeIcon,
    },
  ];

  const gardenSizes = [
    {
      id: "small",
      title: "Small",
      description: "Up to 100 sq meters",
      price: "₦5,000",
    },
    {
      id: "medium",
      title: "Medium",
      description: "100-250 sq meters",
      price: "₦8,500",
    },
    {
      id: "large",
      title: "Large",
      description: "250-500 sq meters",
      price: "₦12,000",
    },
    {
      id: "xlarge",
      title: "X-Large",
      description: "500+ sq meters",
      price: "₦18,000",
    },
  ];

  const serviceFrequencies = [
    {
      id: "one-time",
      title: "One-time Service",
      description: "Single visit",
      price: "+₦0",
    },
    {
      id: "biweekly",
      title: "Bi-weekly",
      description: "Every two weeks",
      price: "-₦500 per visit",
    },
    {
      id: "weekly",
      title: "Weekly",
      description: "Every week",
      price: "-₦1,000 per visit",
    },
    {
      id: "monthly",
      title: "Monthly",
      description: "Once a month",
      price: "-₦250 per visit",
    },
  ];

  const toggleService = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleContinue = () => {
    // Make sure at least one service, garden size and frequency are selected
    if (selectedServices.length > 0 && gardenSize && frequency) {
      // Save the selected options to localStorage
      localStorage.setItem(
        "gardeningServices",
        JSON.stringify({
          services: selectedServices,
          gardenSize: gardenSize,
          frequency: frequency,
        })
      );

      const serviceTitles = selectedServices
        .map((id) => gardenServices.find((g) => g.id === id)?.title || id)
        .join(", ");
      localStorage.setItem(
        "pendingBooking",
        JSON.stringify({
          serviceType: "gardening",
          serviceName: "Gardening Service",
          serviceCategory: "Garden Care",
          serviceData: {
            category: "Garden Care",
            services: selectedServices,
            gardenSize,
            frequency,
          },
          details: [
            { label: "Services", value: serviceTitles },
            { label: "Garden size", value: gardenSizes.find((g) => g.id === gardenSize)?.title || gardenSize },
            { label: "Frequency", value: serviceFrequencies.find((f) => f.id === frequency)?.title || frequency },
          ],
        })
      );
      localStorage.removeItem("bookingSchedule");

      router.push("/booking-summary");
    }
  };

  const isReadyToContinue =
    selectedServices.length > 0 && gardenSize && frequency;

  return (
    <>
      <Head>
        <title>Gardening Services | Home Services</title>
        <meta
          name="description"
          content="Book our professional gardening services"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Top service info banner */}
        <ServiceHeader title="Gardening" subtitle="Customize your gardening service" width="narrow" />

        <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Garden services selection */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 flex items-center justify-center mr-3 shrink-0"><GardeningIcon size={38} /></div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Garden Services
                </h2>
                <p className="text-sm text-gray-500">
                  Select the services you need (multiple selection allowed)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gardenServices.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 rounded-xl flex items-start border-2 transition-all duration-200 cursor-pointer ${
                    selectedServices.includes(service.id)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  onClick={() => toggleService(service.id)}
                >
                  <div className="mr-4 mt-1">
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                        selectedServices.includes(service.id)
                          ? "border-green-600 bg-green-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedServices.includes(service.id) && (
                        <svg
                          className="h-4 w-4 text-white"
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
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <div className="w-8 h-8 flex items-center justify-center mr-2 shrink-0">
                        <service.Icon size={32} />
                      </div>
                      <span className="text-lg font-medium text-gray-900">
                        {service.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-10">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Garden size selection */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 flex items-center justify-center mr-3 shrink-0"><PlotIcon size={38} /></div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Garden Size
                </h2>
                <p className="text-sm text-gray-500">
                  Select the size of your garden
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {gardenSizes.map((size) => (
                <div
                  key={size.id}
                  className={`p-4 rounded-xl flex items-center justify-between border-2 transition-all duration-200 cursor-pointer ${
                    gardenSize === size.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  onClick={() => setGardenSize(size.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                        gardenSize === size.id
                          ? "border-green-600"
                          : "border-gray-300"
                      }`}
                    >
                      {gardenSize === size.id && (
                        <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      )}
                    </div>
                    <div>
                      <span className="text-base font-medium text-gray-900">
                        {size.title}
                      </span>
                      <p className="text-sm text-gray-600">
                        {size.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {size.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service frequency */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 flex items-center justify-center mr-3 shrink-0"><CalendarIcon size={38} /></div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Service Frequency
                </h2>
                <p className="text-sm text-gray-500">
                  How often would you like the service?
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {serviceFrequencies.map((freq) => (
                <div
                  key={freq.id}
                  className={`p-4 rounded-xl flex items-center justify-between border-2 transition-all duration-200 cursor-pointer ${
                    frequency === freq.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  onClick={() => setFrequency(freq.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                        frequency === freq.id
                          ? "border-green-600"
                          : "border-gray-300"
                      }`}
                    >
                      {frequency === freq.id && (
                        <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      )}
                    </div>
                    <div>
                      <span className="text-base font-medium text-gray-900">
                        {freq.title}
                      </span>
                      <p className="text-sm text-gray-600">
                        {freq.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {freq.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service guarantee */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-green-500">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Our Gardening Guarantee
            </h3>
            <div className="space-y-2">
              <div className="flex items-start">
                <ShieldCheckIcon size={22} className="mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Experienced and certified gardeners
                </p>
              </div>
              <div className="flex items-start">
                <ShieldCheckIcon size={22} className="mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Professional equipment for all garden types
                </p>
              </div>
              <div className="flex items-start">
                <ShieldCheckIcon size={22} className="mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Eco-friendly practices and waste removal
                </p>
              </div>
              <div className="flex items-start">
                <ShieldCheckIcon size={22} className="mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Satisfaction guarantee or we'll fix it for free
                </p>
              </div>
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
              className={`w-full py-4 bg-green-600 text-white rounded-xl text-lg font-medium shadow-lg hover:bg-green-700 transition-all duration-300 ${
                !isReadyToContinue ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isReadyToContinue}
            >
              Continue to Booking
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
