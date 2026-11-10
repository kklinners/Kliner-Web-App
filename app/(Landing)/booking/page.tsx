"use client";
import ServiceHeader from "../../components/ServiceHeader";
import { PageLoader } from "../../components/KlinerLoader";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { whatsappLink } from "../../../utils/contact";

export default function BookingPage() {
  const router = useRouter();
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3D covers in Kliner uniforms. Swap these paths for real team photos once they're shot.
  const coverFor = (service) => [`/services/${service}-1.jpg`, `/services/${service}-2.jpg`];
  const servicesWithCovers = ["laundry", "cleaning", "gardening", "repairs", "moving"];

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedService = localStorage.getItem("selectedService");
        if (storedService) {
          const parsedData = JSON.parse(storedService);
          // Add image data to serviceData if not already present
          const serviceName = parsedData.name.toLowerCase();
          setServiceData({
            ...parsedData,
            images: servicesWithCovers.includes(serviceName) ? coverFor(serviceName) : [],
          });
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error loading service data:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [router]);

  const handleMessage = () => {
    const link = whatsappLink(`Hi Kliner, I have a question about the ${serviceData?.name || ""} service.`);
    if (link) window.open(link, "_blank", "noopener,noreferrer");
    else router.push("/help");
  };

  const handleBookNow = () => {
    if (!serviceData || !serviceData.name) {
      alert("No service selected. Please choose a service first.");
      return;
    }
    const serviceName = serviceData.name.toLowerCase();
    const serviceRoutes = {
      laundry: "/booking/laundry",
      cleaning: "/booking/house-cleaning",
      gardening: "/booking/gardning",
      repairs: "/booking/repairs",
      moving: "/booking/moving",
    };
    const routePath =
      serviceRoutes[serviceName] || `/${serviceName.replace(/\s+/g, "-")}`;
    router.push(routePath);
  };

  if (loading) {
    return (
      <PageLoader />
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
        <p className="mb-4">
          Sorry, we couldn't find the service you're looking for.
        </p>
        <Link href="/">
          <div className="bg-brand-600 text-white px-6 py-2 rounded-full hover:bg-brand-700 cursor-pointer">
            Back to Home
          </div>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{serviceData.name} Service | Booking</title>
        <meta
          name="description"
          content={`Book our ${serviceData.name} service today`}
        />
      </Head>

      <div className="min-h-screentext-black bg-gray-50">
        <ServiceHeader width="medium" />

        <main className="max-w-5xl mx-auto p-4 mb-24">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
            {/* Main image container with consistent height */}
            <div className="h-64 sm:h-80 md:h-96 bg-[#EFEDE8] relative">
              <span className="absolute z-10 top-0 left-4 sm:left-6 w-[60px] h-[68px] sm:w-[76px] sm:h-[84px] bg-brand-600 text-white flex items-center justify-center">
                <span role="img" aria-label="Kliner" className="logo-mask aspect-[318/342] h-8 sm:h-10" />
              </span>
              <Image
                src="/landing/kliner-house-v4.png"
                alt={`Kliner team at work on a home, for the ${serviceData.name} service`}
                width={2520}
                height={1464}
                priority
                sizes="(min-width: 1024px) 992px, 100vw"
                className="w-full h-full object-contain p-3 sm:p-5"
              />
            </div>

            <div className="p-6">
              <h1 className="text-3xl font-bold text-black">
                {serviceData.name}
              </h1>
              <div className="mt-2 py-2">
                <span className="inline-block bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm">
                  {serviceData.name}
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold text-brand-600">
                {serviceData.price}
              </div>
              <p className="mt-4 text-gray-600">{serviceData.description}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center text-black mb-4">
              <div>
                <h2 className="text-xl font-bold">Kliner at work</h2>
                <p className="text-sm text-gray-500">Illustrations of our teams and uniforms</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {serviceData.images && serviceData.images.length > 0 ? (
                serviceData.images.slice(0, 2).map((image, index) => (
                  <div
                    key={index}
                    className="bg-[#EFEDE8] rounded-lg aspect-[4/3] overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`Illustration of a Kliner team member in uniform, ${serviceData.name.toLowerCase()} ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        
                      }}
                    />
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-gray-200 rounded-lg h-40 sm:h-48 md:h-56"></div>
                  <div className="bg-gray-200 rounded-lg h-40 sm:h-48 md:h-56"></div>
                </>
              )}
            </div>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 flex gap-4 shadow-lg">
          <button
            onClick={handleMessage}
            className="flex-1 border border-brand-600 text-brand-600 py-3 rounded-lg font-medium"
          >
            Message
          </button>
          <button
            onClick={handleBookNow}
            className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-medium"
          >
            Book Now
          </button>
        </div>
      </div>
    </>
  );
}
22423830327