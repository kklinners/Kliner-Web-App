// Shared list of Kliner services, used by the service icons and the search bar.
import {
  CleaningIcon,
  LaundryIcon,
  MovingIcon,
  GardeningIcon,
  RepairsIcon,
} from "./icons/KlinIcons";
import { startingPrice, formatNaira } from "../../utils/pricing";

const fromPrice = (serviceType) => `From ${formatNaira(startingPrice(serviceType))}`;

export const SERVICES = [
  {
    name: "Cleaning",
    keywords: ["house cleaning","home cleaning","standard cleaning","deep cleaning","move-in cleaning","move-out cleaning","cleaner","sweeping","mopping","apartment","office cleaning"],
    Icon: CleaningIcon,
    color: "bg-brand-100",
    price: fromPrice("house_cleaning"),
    rating: 4.7,
    reviews: 12500,
    description:
      "Professional home cleaning services for any size of residence.",
    mainImage: "/images/cleaning-service.jpg",
    images: ["/public/room1.svg", "/public/room1.svg", "/public/room1.svg"],
  },
  {
    name: "Laundry",
    keywords: ["laundry","washing","wash","ironing","iron","folding","fold","clothes","dry cleaning"],
    Icon: LaundryIcon,
    color: "bg-amber-50",
    price: fromPrice("laundry"),
    rating: 4.5,
    reviews: 8000,
    description:
      "Wash, dry, and fold laundry services with eco-friendly options available.",
    mainImage: "/images/laundry-service.jpg",
    images: ["/public/room1.svg", "/public/room1.svg", "/public/room1.svg"],
  },
  {
    name: "Moving",
    keywords: ["moving","move","relocation","relocate","truck","packing","pack","house moving","move out"],
    Icon: MovingIcon,
    color: "bg-cyan-50",
    price: fromPrice("move_out"),
    rating: 4.6,
    reviews: 5400,
    description:
      "Professional moving services for homes and businesses of all sizes.",
    mainImage: "/images/moving-service.jpg",
    images: [
      "/images/moving-1.jpg",
      "/images/moving-2.jpg",
      "/images/moving-3.jpg",
      "/images/moving-4.jpg",
    ],
  },
  {
    name: "Gardening",
    keywords: ["gardening","garden","lawn","lawn mowing","mowing","hedge","hedge trimming","weeding","planting","pruning","leaf removal","landscaping"],
    Icon: GardeningIcon,
    color: "bg-green-50",
    price: fromPrice("gardening"),
    rating: 4.4,
    reviews: 3200,
    description: "Garden maintenance, lawn care, and plant care services.",
    mainImage: "/images/gardening-service.jpg",
    images: [
      "/images/moving-1.jpg",
      "/images/moving-2.jpg",
      "/images/moving-3.jpg",
      "/images/moving-4.jpg",
    ],
  },
  {
    name: "Repairs",
    keywords: ["repairs","repair","fix","plumbing","plumber","electrical","electrician","appliance","carpentry","carpenter","painting","painter","handyman","leak"],
    Icon: RepairsIcon,
    color: "bg-rose-50",
    price: fromPrice("repairs"),
    rating: 4.8,
    reviews: 7800,
    description:
      "Household repairs and maintenance for appliances, furniture, and more.",
    mainImage: "/images/repairs-service.jpg",
    images: [
      "/images/repairs-1.jpg",
      "/images/repairs-2.jpg",
      "/images/repairs-3.jpg",
      "/images/repairs-4.jpg",
    ],
  },
];

/** Open a service's booking page (same behaviour as tapping its icon). */
export const openService = (router, service) => {
  // Icon is a component, so keep it out of localStorage
  const { Icon, ...serviceData } = service;
  localStorage.setItem("selectedService", JSON.stringify(serviceData));
  router.push(`/booking?service=${service.name.toLowerCase()}`);
};

/** Find services matching a search query, best matches first. */
export const searchServices = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SERVICES.map((service) => {
    const name = service.name.toLowerCase();
    let score = 0;
    let matched = "";
    if (name.startsWith(q)) score = 3;
    else if (name.includes(q)) score = 2;
    else {
      matched = service.keywords.find((k) => k.includes(q) || q.includes(k)) || "";
      if (matched) score = 1;
      if (!matched && service.description.toLowerCase().includes(q)) score = 0.5;
    }
    return { service, score, matched };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
};
