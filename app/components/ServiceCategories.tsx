"use client";
import { useRouter } from "next/navigation";
import { SERVICES, openService } from "./serviceCatalog";

export default function ServiceCategories() {
  const router = useRouter();

  return (
    <div className="lg:bg-white lg:rounded-lg lg:p-6 lg:shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-brand-600 lg:text-2xl">
        Services
      </h2>

      {/* All categories visible at once — 3 per row on phones, 5 on larger screens */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 lg:gap-4">
        {SERVICES.map((category) => (
          <button
            key={category.name}
            type="button"
            onClick={() => openService(router, category)}
            className="flex flex-col items-center text-center bg-white border border-gray-100 rounded-2xl p-3 lg:p-4 shadow-sm hover:shadow-md hover:border-brand-200 transition-all"
          >
            <span
              className={`w-14 h-14 lg:w-16 lg:h-16 ${category.color} rounded-2xl flex items-center justify-center mb-2`}
            >
              <category.Icon size={34} />
            </span>
            <span className="text-sm lg:text-base font-semibold text-gray-900">
              {category.name}
            </span>
            <span className="text-xs text-brand-600 font-semibold mt-0.5">
              {category.price}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
