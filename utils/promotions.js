// Shared by the admin editor and the customer banner.
// Colours are real values (not Tailwind classes) so they work wherever a banner is drawn.
export const THEMES = {
  purple: { label: "Purple", color: "#3310C2" },
  violet: { label: "Violet", color: "#6B46E6" },
  night: { label: "Night", color: "#19085E" },
};

export const ART_OPTIONS = [
  { value: "none", label: "No picture" },
  { value: "cleaning", label: "Cleaning room" },
  { value: "laundry", label: "Laundry room" },
  { value: "moving", label: "Moving boxes" },
  { value: "gardening", label: "Garden" },
  { value: "repairs", label: "Repairs workshop" },
];

export const SERVICE_TARGETS = [
  { value: "", label: "Nothing (banner only)" },
  { value: "cleaning", label: "Cleaning" },
  { value: "laundry", label: "Laundry" },
  { value: "moving", label: "Moving" },
  { value: "gardening", label: "Gardening" },
  { value: "repairs", label: "Repairs" },
];

export const artSrc = (art) => (art && art !== "none" ? `/services/${art}-1.jpg` : null);

// The names used in serviceCatalog.tsx
export const SERVICE_NAME = { cleaning: "Cleaning", laundry: "Laundry", moving: "Moving", gardening: "Gardening", repairs: "Repairs" };
