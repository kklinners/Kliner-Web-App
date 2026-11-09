// File: components/SpecialOffers.js
"use client"
import { useState, useEffect } from "react";

export default function SpecialOffers() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      discount: "30%",
      title: "Today's Special!",
      description: "Get discount for every\norder",
      image: "/hero-img.svg",
      imageType: "cutout", // transparent image, sits on the card colour
      bgColor: "bg-brand-500",
      fadeColor: "#6B46E6",
    },
    {
      discount: "25%",
      title: "Weekend Deal",
      description: "Book any premium service\nfor the weekend",
      image: "/cleaning2.jpg",
      imageType: "photo", // full photo, fades into the card colour
      bgColor: "bg-brand-900",
      fadeColor: "#19085E",
    },
    {
      discount: "20%",
      title: "First-Time Users",
      description: "Special discount for\nnew customers",
      image: "/laundry3.jpg",
      imageType: "photo",
      bgColor: "bg-brand-600",
      fadeColor: "#3310C2",
    },
  ];

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Manual slide navigation
  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-black font-bold lg:text-2xl">Special Offers</h2>
        <a
          href="#"
          className="text-brand-600 text-sm lg:text-base hover:underline"
        >
          See All
        </a>
      </div>

      <div className="relative">
        {/* Slides Container */}
        <div
          className={`${slides[activeSlide].bgColor} rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow`}
        >
          <div className="relative flex items-center p-6 lg:p-8">
            {slides[activeSlide].imageType === "photo" && (
              <div className="absolute inset-y-0 right-0 w-1/2">
                <img
                  src={slides[activeSlide].image}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, ${slides[activeSlide].fadeColor} 0%, ${slides[activeSlide].fadeColor}00 70%)`,
                  }}
                />
              </div>
            )}
            <div className="text-white relative z-10">
              <div className="text-5xl font-bold mb-1 lg:text-6xl">
                {slides[activeSlide].discount}
              </div>
              <h3 className="text-lg font-bold mb-1 lg:text-2xl">
                {slides[activeSlide].title}
              </h3>
              <p className="text-sm opacity-90 lg:text-base whitespace-pre-line">
                {slides[activeSlide].description}
              </p>
            </div>
            {slides[activeSlide].imageType === "cutout" && (
              <div className="ml-auto">
                <img
                  src={slides[activeSlide].image}
                  alt="Promotional image"
                  className="h-24 object-contain lg:h-32"
                />
              </div>
            )}
          </div>

          {/* Slider indicators */}
          <div className="flex justify-center space-x-2 pb-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === activeSlide
                    ? "w-6 bg-white"
                    : "w-1 bg-white opacity-50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        

        
      </div>
    </div>
  );
}
