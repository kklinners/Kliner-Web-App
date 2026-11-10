// pages/repairs.js
"use client";

import ServiceHeader from "../../../components/ServiceHeader";
import { PlumbingIcon, ElectricalIcon, ApplianceIcon, CarpentryIcon, PaintingIcon, RepairsIcon, ClockIcon, BookingsNavIcon, PhotoIcon, ShieldCheckIcon } from "../../../components/icons/KlinIcons";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function RepairsPage() {
  const router = useRouter();
  const [repairType, setRepairType] = useState(null);
  const [urgency, setUrgency] = useState(null);
  const [description, setDescription] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

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

  const repairTypes = [
    {
      id: "plumbing",
      title: "Plumbing",
      description: "Leaks, blockages, toilet or sink issues",
      Icon: PlumbingIcon,
    },
    {
      id: "electrical",
      title: "Electrical",
      description: "Power outages, light fixtures, outlet problems",
      Icon: ElectricalIcon,
    },
    {
      id: "appliance",
      title: "Appliance Repair",
      description: "Refrigerator, washing machine, oven issues",
      Icon: ApplianceIcon,
    },
    {
      id: "carpentry",
      title: "Carpentry",
      description: "Furniture assembly, door/window repairs, cabinetry",
      Icon: CarpentryIcon,
    },
    {
      id: "painting",
      title: "Painting",
      description: "Interior/exterior painting, touch-ups, wallpaper",
      Icon: PaintingIcon,
    },
    {
      id: "general",
      title: "General Handyman",
      description: "TV mounting, small fixes, installations",
      Icon: RepairsIcon,
    },
  ];

  const urgencyLevels = [
    {
      id: "standard",
      title: "Standard",
      description: "Within 2-3 days",
      price: "Standard Rate",
    },
    {
      id: "priority",
      title: "Priority",
      description: "Within 24 hours",
      price: "+₦2,000",
    },
    {
      id: "emergency",
      title: "Emergency",
      description: "Within 3-6 hours",
      price: "+₦5,000",
    },
  ];

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files as File[]);
    if (files.length > 0) {
      // In a real app, you would upload these to a server
      // For now, we'll just create local URLs
      const newPhotos = files.map((file) => ({
        id: Math.random().toString(36).substring(2, 11),
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      }));

      setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (photoId) => {
    setUploadedPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const handleContinue = () => {
    if (repairType && urgency) {
      // Save the selected options to localStorage
      localStorage.setItem(
        "repairRequest",
        JSON.stringify({
          repairType,
          urgency,
          description,
          photosCount: uploadedPhotos.length,
        })
      );

      const typeTitle =
        repairTypes.find((t) => t.id === repairType)?.title || repairType;
      const urgencyTitle =
        urgencyLevels.find((u) => u.id === urgency)?.title || urgency;
      localStorage.setItem(
        "pendingBooking",
        JSON.stringify({
          serviceType: "repairs",
          serviceName: "Repair Service",
          serviceCategory: `${typeTitle} Repair`,
          serviceData: {
            repairType,
            urgency,
            description,
            photosCount: uploadedPhotos.length,
          },
          details: [
            { label: "Urgency", value: urgencyTitle },
            ...(description ? [{ label: "Description", value: description }] : []),
          ],
        })
      );
      localStorage.removeItem("bookingSchedule");

      router.push("/booking-summary");
    }
  };

  const isReadyToContinue = repairType && urgency;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <>
      <Head>
        <title>Repair Services | Home Services</title>
        <meta
          name="description"
          content="Book our professional repair services"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Top service info banner */}
        <ServiceHeader title="Repairs" subtitle="Request a repair specialist" width="narrow" />

        <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Repair type selection */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 flex items-center justify-center mr-3 shrink-0"><RepairsIcon size={38} /></div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Select Repair Type
                </h2>
                <p className="text-sm text-gray-500">
                  Choose the type of repair service you need
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repairTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 rounded-xl flex items-start border-2 transition-all duration-200 cursor-pointer ${
                    repairType === type.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-brand-300"
                  }`}
                  onClick={() => setRepairType(type.id)}
                >
                  <div className="mr-4 mt-1">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        repairType === type.id
                          ? "border-brand-600"
                          : "border-gray-300"
                      }`}
                    >
                      {repairType === type.id && (
                        <div className="w-3 h-3 rounded-full bg-brand-600"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <div className="w-8 h-8 flex items-center justify-center mr-2 shrink-0">
                        <type.Icon size={32} />
                      </div>
                      <span className="text-lg font-medium text-gray-900">
                        {type.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-10">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency selection */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 flex items-center justify-center mr-3 shrink-0"><ClockIcon size={38} /></div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  How Urgent Is Your Request?
                </h2>
                <p className="text-sm text-gray-500">
                  Select the required response time
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {urgencyLevels.map((level) => (
                <div
                  key={level.id}
                  className={`p-4 rounded-xl flex items-center justify-between border-2 transition-all duration-200 cursor-pointer ${
                    urgency === level.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-brand-300"
                  }`}
                  onClick={() => setUrgency(level.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                        urgency === level.id
                          ? "border-brand-600"
                          : "border-gray-300"
                      }`}
                    >
                      {urgency === level.id && (
                        <div className="w-3 h-3 rounded-full bg-brand-600"></div>
                      )}
                    </div>
                    <div>
                      <span className="text-base font-medium text-gray-900">
                        {level.title}
                      </span>
                      <p className="text-sm text-gray-600">
                        {level.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-base font-medium text-brand-600">
                    {level.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description and photos */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 flex items-center justify-center mr-3 shrink-0"><BookingsNavIcon size={38} /></div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Describe Your Issue
                </h2>
                <p className="text-sm text-gray-500">
                  Provide details to help our technicians prepare
                </p>
              </div>
            </div>

            {/* Description textarea */}
            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Problem Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-brand-500 focus:ring-brand-500 focus:outline-none"
                placeholder="Please describe what needs to be repaired..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-400 transition-all">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <PhotoIcon size={52} className="mx-auto" />
                  <p className="mt-1 text-sm text-gray-600">
                    {uploadedPhotos.length > 0
                      ? "Click to add more photos"
                      : "Click to upload photos"}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </label>
              </div>

              {/* Photo preview */}
              {uploadedPhotos.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Uploaded Photos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={photo.url}
                            alt="Repair issue"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
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
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {photo.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(photo.size)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service guarantee */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-brand-500">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Our Repair Guarantee
            </h3>
            <div className="space-y-2">
              <div className="flex items-start">
                <ShieldCheckIcon size={22} className="mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  All repair work comes with a 90-day warranty
                </p>
              </div>
              <div className="flex items-start">
                <ShieldCheckIcon size={22} className="mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Vetted, licensed, and experienced professionals
                </p>
              </div>
              <div className="flex items-start">
                <ShieldCheckIcon size={22} className="mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Fixed price quotes before work begins
                </p>
              </div>
              <div className="flex items-start">
                <ShieldCheckIcon size={22} className="mr-2 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  100% satisfaction guarantee
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
              className={`w-full py-4 bg-brand-600 text-white rounded-xl text-lg font-medium shadow-lg hover:bg-brand-700 transition-all duration-300 ${
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
