// Kliner custom icon set — bold, two-tone, food-app style illustrations.
// All icons share a 48x48 grid so they line up in tiles and lists.
import type { SVGProps } from "react";

export type KlinIconProps = SVGProps<SVGSVGElement> & { size?: number };

const BRAND = "#3310C2";
const BRAND_DARK = "#1F0A7A";
const BRAND_LIGHT = "#C9BEF7";
const AMBER = "#FFB020";

const Svg = ({ size = 32, children, ...rest }: KlinIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

/* ---------------- Services ---------------- */

export const CleaningIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M17 6h11a3 3 0 0 1 3 3v3H17a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill={BRAND_DARK} />
    <path d="M31 8h5l-2 4h-3z" fill={BRAND_DARK} />
    <rect x="19" y="12" width="9" height="6" fill={BRAND_DARK} />
    <path d="M16 22a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4h-7a4 4 0 0 1-4-4Z" fill={BRAND} />
    <rect x="19" y="26" width="9" height="10" rx="2" fill="#fff" />
    <path d="M21 31h5" stroke={BRAND} strokeWidth="2" strokeLinecap="round" />
    <circle cx="40" cy="7" r="1.6" fill={AMBER} />
    <circle cx="43" cy="11" r="1.4" fill={AMBER} />
    <circle cx="40" cy="14" r="1.2" fill={AMBER} />
    <path d="M38 25l1.5 3.5L43 30l-3.5 1.5L38 35l-1.5-3.5L33 30l3.5-1.5Z" fill={AMBER} />
  </Svg>
);

export const LaundryIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="12" y="41" width="4" height="3" rx="1" fill="#B45309" />
    <rect x="32" y="41" width="4" height="3" rx="1" fill="#B45309" />
    <rect x="9" y="6" width="30" height="36" rx="6" fill="#F59E0B" />
    <path d="M15 6h18a6 6 0 0 1 6 6v3H9v-3a6 6 0 0 1 6-6Z" fill="#B45309" />
    <circle cx="15" cy="10.5" r="1.6" fill="#fff" />
    <rect x="25" y="9" width="10" height="3" rx="1.5" fill="#FDE68A" />
    <circle cx="24" cy="28" r="10" fill="#fff" />
    <circle cx="24" cy="28" r="7.5" fill="#DBEAFE" />
    <path d="M16.65 29.5c2.45-1.6 4.9-1.6 7.35 0s4.9 1.6 7.35 0A7.5 7.5 0 0 1 16.65 29.5Z" fill="#3B82F6" />
    <circle cx="21" cy="25" r="1.2" fill="#fff" />
    <circle cx="26" cy="23.5" r="0.9" fill="#fff" />
  </Svg>
);

export const MovingIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="4" y="13" width="24" height="19" rx="3" fill="#0891B2" />
    <rect x="10" y="17.5" width="12" height="10" rx="1.5" fill={AMBER} />
    <rect x="15" y="17.5" width="2" height="4" fill="#B45309" />
    <path d="M28 19h8.5a3 3 0 0 1 2.6 1.5l3.9 6.8V32H28Z" fill="#155E75" />
    <path d="M31 21.5h5l2.8 5H31Z" fill="#A5F3FC" />
    <rect x="4" y="31" width="40" height="3" rx="1.5" fill="#155E75" />
    <circle cx="13" cy="35" r="4.5" fill="#1E293B" />
    <circle cx="13" cy="35" r="1.8" fill="#fff" />
    <circle cx="36" cy="35" r="4.5" fill="#1E293B" />
    <circle cx="36" cy="35" r="1.8" fill="#fff" />
  </Svg>
);

export const GardeningIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M23 26C14 26 9 20 9 12c8 0 14 5 14 14Z" fill="#16A34A" />
    <path d="M25 22c0-8 5-13 14-13 0 8-5 13-14 13Z" fill="#22C55E" />
    <path d="M23 26 14 16M25 22l9-9" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" opacity=".45" />
    <path d="M24 31V18" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M14 35h20l-2.5 9a2 2 0 0 1-2 1.5H18.5a2 2 0 0 1-2-1.5Z" fill="#EA580C" />
    <rect x="12" y="30" width="24" height="5.5" rx="2" fill="#C2410C" />
  </Svg>
);

export const RepairsIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M18 14v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3" stroke="#9F1239" strokeWidth="3" />
    <rect x="6" y="14" width="36" height="26" rx="5" fill="#E11D48" />
    <rect x="6" y="22" width="36" height="3" fill="#9F1239" />
    <rect x="20" y="19.5" width="8" height="8" rx="2" fill={AMBER} />
    <rect x="10" y="17" width="6" height="2" rx="1" fill="#fff" opacity=".5" />
  </Svg>
);

/* ---------------- Cleaning types ---------------- */

export const DeepCleanIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M22 8l3.2 8.8L34 20l-8.8 3.2L22 32l-3.2-8.8L10 20l8.8-3.2Z" fill={BRAND} />
    <path d="M36 28l1.8 4.2L42 34l-4.2 1.8L36 40l-1.8-4.2L30 34l4.2-1.8Z" fill={AMBER} />
    <circle cx="12" cy="36" r="2.5" fill={BRAND_LIGHT} />
  </Svg>
);

export const MoveInIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M8 20l-3-6h14l5 6Z" fill="#FBBF24" />
    <path d="M40 20l3-6H29l-5 6Z" fill="#FBBF24" />
    <rect x="8" y="20" width="32" height="22" rx="3" fill="#F59E0B" />
    <rect x="21" y="20" width="6" height="9" fill="#FDE68A" />
    <rect x="12" y="34" width="8" height="4" rx="1" fill="#fff" />
  </Svg>
);

export const MoveOutIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M24 7 6 22h5v18a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V22h5Z" fill={BRAND} />
    <rect x="18" y="29" width="8" height="13" rx="1.5" fill={BRAND_LIGHT} />
    <circle cx="37" cy="36" r="8" fill={AMBER} />
    <path d="M33.5 36h7M38 32.5l3.5 3.5-3.5 3.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ---------------- Notifications / account ---------------- */

export const WalletIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M10 12l20-6a3 3 0 0 1 3.7 2.1L35 12Z" fill={BRAND_LIGHT} />
    <rect x="6" y="12" width="34" height="26" rx="5" fill={BRAND} />
    <rect x="28" y="20" width="14" height="10" rx="3" fill={BRAND_DARK} />
    <circle cx="33" cy="25" r="2" fill={AMBER} />
  </Svg>
);

export const GiftIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M24 15c-2-6-10-8-10-3 0 3 5 3 10 3Z" fill="#FBBF24" />
    <path d="M24 15c2-6 10-8 10-3 0 3-5 3-10 3Z" fill="#FBBF24" />
    <rect x="9" y="22" width="30" height="20" rx="3" fill="#EC4899" />
    <rect x="6" y="15" width="36" height="8" rx="2.5" fill="#BE185D" />
    <rect x="21.5" y="15" width="5" height="27" fill="#FBBF24" />
  </Svg>
);

export const CardIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="5" y="11" width="38" height="26" rx="5" fill={BRAND} />
    <rect x="5" y="17" width="38" height="5" fill={BRAND_DARK} />
    <rect x="10" y="26" width="8" height="6" rx="1.5" fill={AMBER} />
    <rect x="24" y="29" width="13" height="2.5" rx="1.25" fill={BRAND_LIGHT} />
  </Svg>
);

export const UserIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <circle cx="24" cy="17" r="8" fill={BRAND} />
    <path d="M9 41c0-8 6.7-13 15-13s15 5 15 13a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2Z" fill={BRAND} />
  </Svg>
);

export const UserCheckIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <circle cx="22" cy="17" r="8" fill="#16A34A" />
    <path d="M7 41c0-8 6.7-13 15-13s15 5 15 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z" fill="#16A34A" />
    <circle cx="37" cy="13" r="6" fill={AMBER} />
    <path d="M34.5 13l1.8 1.8 3.4-3.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PencilIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M30 8l10 10-20 20H10V28Z" fill="currentColor" />
    <path d="M27 11l10 10" stroke={BRAND} strokeWidth="2.5" />
  </Svg>
);
