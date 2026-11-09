// FRONTEND copy of kklinners-backend/config/marketplace.js — keep in sync.
// The backend rejects bookings outside these areas.

export const LAUNCH_DISTRICT = "Gbagada";

export const SERVICE_AREAS = [
  "Gbagada Phase 1",
  "Gbagada Phase 2",
  "Gbagada Estate",
  "Ifako-Gbagada",
  "Soluyi",
  "Atunrase Estate",
  "Medina Estate",
  "Millennium/UPS Estate",
  "New Garage",
  "Pedro",
  "Charley Boy",
];

export const COMMISSION_RATE = 0.15;

export const SERVICE_TYPE_LABELS = {
  house_cleaning: "House Cleaning",
  laundry: "Laundry",
  move_out: "Moving",
  repairs: "Repairs",
  gardening: "Gardening",
};
