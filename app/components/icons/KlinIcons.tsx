// Kliner custom icon set — bold, two-tone, food-app style illustrations.
// All icons share a 48x48 grid so they line up in tiles and lists.
import type { ReactElement, SVGProps } from "react";

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

/* ---------------- Rooms ---------------- */

export const SofaIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="9" y="12" width="30" height="16" rx="5" fill={BRAND} />
    <rect x="3.5" y="21" width="9" height="17" rx="4.5" fill={BRAND_DARK} />
    <rect x="35.5" y="21" width="9" height="17" rx="4.5" fill={BRAND_DARK} />
    <rect x="10" y="25" width="28" height="12" rx="3.5" fill={BRAND_LIGHT} />
    <path d="M24 26v10" stroke={BRAND} strokeWidth="1.6" strokeLinecap="round" />
    <rect x="13" y="15.5" width="8" height="8" rx="2.5" fill={AMBER} transform="rotate(-8 17 19.5)" />
    <rect x="9" y="37" width="3.5" height="5" rx="1.5" fill={BRAND_DARK} />
    <rect x="35.5" y="37" width="3.5" height="5" rx="1.5" fill={BRAND_DARK} />
  </Svg>
);

export const BedIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="5" y="9" width="4.5" height="32" rx="2.25" fill={BRAND_DARK} />
    <rect x="5" y="28" width="38" height="9" rx="2.5" fill={BRAND} />
    <rect x="9" y="21" width="32" height="10" rx="3.5" fill={BRAND_LIGHT} />
    <rect x="12" y="16.5" width="11" height="7" rx="3.5" fill="#fff" />
    <path d="M24 21.5h14a3 3 0 0 1 3 3V31H24Z" fill={BRAND} />
    <rect x="5" y="37" width="4" height="5" rx="1.5" fill={BRAND_DARK} />
    <rect x="39" y="37" width="4" height="5" rx="1.5" fill={BRAND_DARK} />
    <path d="M37 6l1.2 2.8 2.8 1.2-2.8 1.2L37 14l-1.2-2.8L33 10l2.8-1.2Z" fill={AMBER} />
  </Svg>
);

export const BathIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <circle cx="14" cy="15" r="4" fill="#A5F3FC" />
    <circle cx="21" cy="11" r="3" fill="#CFFAFE" />
    <circle cx="19" cy="18" r="2" fill="#A5F3FC" />
    <path d="M34 6h6a2 2 0 0 1 2 2v13h-3V9h-5Z" fill="#94A3B8" />
    <rect x="3" y="21" width="42" height="5" rx="2.5" fill="#155E75" />
    <path d="M6 26h36v3a11 11 0 0 1-11 11H17A11 11 0 0 1 6 29Z" fill="#0891B2" />
    <rect x="11" y="39" width="4" height="5" rx="1.5" fill="#155E75" />
    <rect x="33" y="39" width="4" height="5" rx="1.5" fill="#155E75" />
  </Svg>
);

export const KitchenIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="7" y="21" width="34" height="21" rx="4" fill="#475569" />
    <rect x="7" y="21" width="34" height="6" rx="3" fill="#334155" />
    <rect x="13" y="31" width="22" height="8" rx="2" fill="#94A3B8" />
    <circle cx="13" cy="24" r="1.4" fill="#fff" />
    <circle cx="19" cy="24" r="1.4" fill="#fff" />
    <circle cx="35" cy="24" r="1.4" fill={AMBER} />
    <rect x="12" y="11" width="24" height="11" rx="3" fill={BRAND} />
    <rect x="21" y="7" width="6" height="4" rx="2" fill={BRAND_DARK} />
    <rect x="7.5" y="14" width="5.5" height="3.5" rx="1.75" fill={BRAND_DARK} />
    <rect x="35" y="14" width="5.5" height="3.5" rx="1.75" fill={BRAND_DARK} />
    <path d="M40 3l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1Z" fill={AMBER} />
  </Svg>
);

export const DiningIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="1.5" y="13" width="3.5" height="18" rx="1.75" fill={AMBER} />
    <rect x="1.5" y="29" width="9" height="3.5" rx="1.75" fill={AMBER} />
    <rect x="3" y="32" width="2.5" height="10" rx="1" fill="#B45309" />
    <rect x="43" y="13" width="3.5" height="18" rx="1.75" fill={AMBER} />
    <rect x="37.5" y="29" width="9" height="3.5" rx="1.75" fill={AMBER} />
    <rect x="42.5" y="32" width="2.5" height="10" rx="1" fill="#B45309" />
    <rect x="9" y="21" width="30" height="5" rx="2.5" fill={BRAND_DARK} />
    <rect x="12" y="26" width="4" height="16" rx="1.5" fill={BRAND} />
    <rect x="32" y="26" width="4" height="16" rx="1.5" fill={BRAND} />
    <ellipse cx="24" cy="19.5" rx="8" ry="2.6" fill="#fff" />
    <ellipse cx="24" cy="19" rx="4.5" ry="1.4" fill={BRAND_LIGHT} />
  </Svg>
);

export const TerraceIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="12" r="5.5" fill={AMBER} />
    <path d="M30 15h10l-1.2 6H31.2Z" fill="#EA580C" />
    <path d="M35 15c-5 0-8-3-8-8 5 0 8 3 8 8Z" fill="#22C55E" />
    <path d="M35 15c0-5 3-8 8-8 0 5-3 8-8 8Z" fill="#16A34A" />
    <rect x="2" y="21" width="44" height="3.5" rx="1.75" fill={BRAND_DARK} />
    <rect x="7" y="24.5" width="2.2" height="14" fill={BRAND} />
    <rect x="14" y="24.5" width="2.2" height="14" fill={BRAND} />
    <rect x="21" y="24.5" width="2.2" height="14" fill={BRAND} />
    <rect x="28" y="24.5" width="2.2" height="14" fill={BRAND} />
    <rect x="35" y="24.5" width="2.2" height="14" fill={BRAND} />
    <rect x="41" y="24.5" width="2.2" height="14" fill={BRAND} />
    <rect x="2" y="38" width="44" height="4.5" rx="2" fill={BRAND_DARK} />
  </Svg>
);

export const GarageIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M3 19 24 6l21 13v23a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" fill={BRAND} />
    <path d="M3 19 24 6l21 13-2.4 3.6L24 11 5.4 22.6Z" fill={BRAND_DARK} />
    <rect x="10" y="23" width="28" height="21" rx="2" fill={BRAND_LIGHT} />
    <path d="M10 29h28M10 35h28" stroke={BRAND} strokeWidth="1.8" />
    <rect x="10" y="41" width="28" height="3" fill={BRAND_DARK} />
    <circle cx="24" cy="15" r="2.2" fill={AMBER} />
  </Svg>
);

/* ---------------- Repair types ---------------- */

export const PlumbingIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="19" y="4" width="10" height="4.5" rx="2.25" fill={BRAND_DARK} />
    <rect x="22" y="8" width="4" height="6" fill={BRAND_DARK} />
    <path d="M6 14H32A9 9 0 0 1 41 23V29H33V23A1 1 0 0 0 32 22H6Z" fill="#3B82F6" />
    <path d="M37 32c3 4 4.2 6 4.2 8a4.2 4.2 0 0 1-8.4 0c0-2 1.2-4 4.2-8Z" fill="#60A5FA" />
    <circle cx="26" cy="38" r="1.8" fill="#93C5FD" />
    <circle cx="9" cy="18" r="1.4" fill="#fff" opacity=".55" />
  </Svg>
);

export const ElectricalIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <circle cx="24" cy="20" r="13" fill={AMBER} />
    <rect x="17" y="31" width="14" height="4.5" rx="1.5" fill="#B45309" />
    <rect x="19" y="36" width="10" height="4" rx="2" fill="#78350F" />
    <path d="M26.5 10l-8 12h5.5l-2.5 9 9-13.5h-5.5Z" fill="#fff" />
    <path d="M40 6l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1Z" fill={BRAND} />
  </Svg>
);

export const ApplianceIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="5" y="12" width="38" height="25" rx="4" fill="#475569" />
    <rect x="9" y="16" width="23" height="17" rx="2.5" fill="#94A3B8" />
    <rect x="11.5" y="18.5" width="18" height="12" rx="1.5" fill="#CBD5E1" />
    <rect x="35" y="17" width="5" height="3" rx="1.5" fill="#fff" />
    <circle cx="37.5" cy="25" r="2.3" fill={AMBER} />
    <circle cx="37.5" cy="31" r="1.5" fill="#fff" />
    <rect x="9" y="37" width="4" height="4" rx="1.5" fill="#334155" />
    <rect x="35" y="37" width="4" height="4" rx="1.5" fill="#334155" />
    <path d="M18 24.5h6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const CarpentryIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="5" y="35" width="28" height="7" rx="1.5" fill="#F59E0B" />
    <path d="M9 38.5h20" stroke="#B45309" strokeWidth="1.4" strokeLinecap="round" />
    <g transform="rotate(40 28 20)">
      <rect x="26" y="10" width="4.5" height="30" rx="2.25" fill="#B45309" />
      <rect x="18" y="5" width="20" height="9" rx="2.5" fill="#475569" />
      <rect x="18" y="5" width="6" height="9" rx="2.5" fill="#64748B" />
    </g>
  </Svg>
);

export const PaintingIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="6" y="7" width="30" height="11" rx="3.5" fill={BRAND} />
    <path d="M10 18v6a2 2 0 0 0 4 0v-6Z" fill={BRAND_LIGHT} />
    <path d="M36 12.5h3a3 3 0 0 1 3 3V22a3 3 0 0 1-3 3H25v5" stroke={BRAND_DARK} strokeWidth="3" strokeLinecap="round" fill="none" />
    <rect x="22" y="29" width="6" height="14" rx="3" fill={AMBER} />
    <path d="M9 11h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".45" />
  </Svg>
);

/* ---------------- Garden jobs ---------------- */

export const LawnMowerIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M10 28v-4a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v4Z" fill="#22C55E" />
    <rect x="6" y="27" width="28" height="8" rx="3" fill="#16A34A" />
    <path d="M30 21l7-12h5" stroke="#166534" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="13" cy="37" r="5" fill="#1E293B" />
    <circle cx="13" cy="37" r="1.8" fill="#fff" />
    <circle cx="29" cy="37" r="5" fill="#1E293B" />
    <circle cx="29" cy="37" r="1.8" fill="#fff" />
    <path d="M36 44l1.5-5 1.5 5M40.5 44l1.2-4 1.3 4" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" fill="none" />
    <circle cx="18" cy="23" r="1.6" fill={AMBER} />
  </Svg>
);

export const HedgeIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="5" y="14" width="38" height="20" rx="7" fill="#16A34A" />
    <circle cx="14" cy="20" r="4" fill="#22C55E" />
    <circle cx="24" cy="18" r="4.5" fill="#22C55E" />
    <circle cx="34" cy="21" r="4" fill="#22C55E" />
    <circle cx="19" cy="27" r="3.5" fill="#22C55E" />
    <circle cx="30" cy="28" r="3.5" fill="#22C55E" />
    <rect x="3" y="34" width="42" height="5" rx="2.5" fill="#92400E" />
    <path d="M36 5l8 8M44 5l-8 8" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    <circle cx="36" cy="5" r="2.4" fill={AMBER} />
    <circle cx="44" cy="5" r="2.4" fill={AMBER} />
  </Svg>
);

export const WeedingIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M3 36c7-5 35-5 42 0v8H3Z" fill="#92400E" />
    <path d="M17 38V26" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M17 28C10 28 6 24 6 17c7 0 11 4 11 11Z" fill="#22C55E" />
    <path d="M17 25c0-7 4-11 11-11 0 7-4 11-11 11Z" fill="#16A34A" />
    <g transform="rotate(25 36 20)">
      <rect x="34.5" y="4" width="3" height="12" rx="1.5" fill="#B45309" />
      <path d="M33 16h6l-1 12a2 2 0 0 1-4 0Z" fill={AMBER} />
    </g>
  </Svg>
);

export const PlantingIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M3 36c7-5 35-5 42 0v8H3Z" fill="#92400E" />
    <path d="M24 38V24" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 28C17 28 13 24 13 17c7 0 11 4 11 11Z" fill="#22C55E" />
    <path d="M24 25c0-7 4-11 11-11 0 7-4 11-11 11Z" fill="#16A34A" />
    <path d="M40 5c2 2.6 2.8 4 2.8 5.2a2.8 2.8 0 0 1-5.6 0c0-1.2.8-2.6 2.8-5.2Z" fill="#60A5FA" />
    <path d="M8 8c1.5 2 2.1 3 2.1 3.9a2.1 2.1 0 0 1-4.2 0c0-.9.6-1.9 2.1-3.9Z" fill="#93C5FD" />
  </Svg>
);

export const PruningIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <g transform="rotate(28 24 24)">
      <rect x="22.2" y="3" width="3.6" height="40" rx="1.8" fill="#94A3B8" />
    </g>
    <g transform="rotate(-28 24 24)">
      <rect x="22.2" y="3" width="3.6" height="40" rx="1.8" fill="#CBD5E1" />
    </g>
    <circle cx="14" cy="39" r="5" stroke="#E11D48" strokeWidth="3.2" fill="none" />
    <circle cx="34" cy="39" r="5" stroke="#E11D48" strokeWidth="3.2" fill="none" />
    <circle cx="24" cy="24" r="2.6" fill={AMBER} />
  </Svg>
);

export const LeafRakeIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M8 40c0-6 4-9 10-9 0 6-4 9-10 9Z" fill="#F59E0B" />
    <path d="M30 42c0-5 3-8 9-8 0 5-3 8-9 8Z" fill="#EA580C" />
    <path d="M38 24c0-4 2-6 6-6 0 4-2 6-6 6Z" fill="#22C55E" />
    <path d="M38 5 24 31" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
    <path d="M14 33l18-4" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    <path d="M16 32l-1 8M21 31l-1 9M26 30l-1 9M31 29l-1 9" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

/* ---------------- Menu ---------------- */

export const HomeNavIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="9" y="20" width="30" height="22" rx="3" fill={BRAND} />
    <path d="M4 23 24 6l20 17" stroke={BRAND_DARK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="20" y="29" width="8" height="13" rx="2" fill={BRAND_LIGHT} />
    <circle cx="34" cy="27" r="2.2" fill={AMBER} />
  </Svg>
);

export const BookingsNavIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="9" y="8" width="30" height="34" rx="4" fill={BRAND} />
    <rect x="17" y="4" width="14" height="8" rx="2.5" fill={BRAND_DARK} />
    <rect x="13" y="14" width="22" height="24" rx="2" fill="#fff" />
    <path d="M17 21h14M17 27h14M17 33h8" stroke={BRAND_LIGHT} strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="35" cy="34" r="5" fill={AMBER} />
    <path d="M32.6 34l1.7 1.7 3.2-3.4" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const HelpNavIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="5" y="6" width="38" height="28" rx="9" fill={BRAND} />
    <path d="M13 33l-3 9 11-8Z" fill={BRAND} />
    <path d="M19.5 17.5a4.6 4.6 0 1 1 7 3.9c-1.8 1.1-2.5 2-2.5 3.6" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
    <circle cx="24" cy="29.5" r="1.9" fill="#fff" />
    <circle cx="39" cy="9" r="3.4" fill={AMBER} />
  </Svg>
);

// Which icon each room gets, wherever rooms are picked
export const ROOM_ICONS: Record<string, (p: KlinIconProps) => ReactElement> = {
  "Living Room": SofaIcon,
  Terrace: TerraceIcon,
  "Terrace/Balcony": TerraceIcon,
  Bedroom: BedIcon,
  Bedrooms: BedIcon,
  Bathroom: BathIcon,
  Bathrooms: BathIcon,
  Kitchen: KitchenIcon,
  Dining: DiningIcon,
  "Dining Room": DiningIcon,
  Garage: GarageIcon,
};

/* ---------------- Sections ---------------- */

export const ClockIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <circle cx="24" cy="25" r="18" fill={BRAND} />
    <circle cx="24" cy="25" r="13.5" fill="#fff" />
    <path d="M24 16v9.5l6.5 4" stroke={BRAND_DARK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="24" cy="25.5" r="2" fill={AMBER} />
    <rect x="21" y="3" width="6" height="4.5" rx="2" fill={BRAND_DARK} />
    <path d="M39 8l-3 3" stroke={AMBER} strokeWidth="3.2" strokeLinecap="round" />
  </Svg>
);

export const CalendarIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="6" y="9" width="36" height="33" rx="5" fill={BRAND} />
    <path d="M6 14a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v5H6Z" fill={BRAND_DARK} />
    <rect x="14" y="4.5" width="4" height="9" rx="2" fill={AMBER} />
    <rect x="30" y="4.5" width="4" height="9" rx="2" fill={AMBER} />
    <rect x="10" y="22" width="28" height="16.5" rx="2.5" fill="#fff" />
    <circle cx="16" cy="27" r="1.8" fill={BRAND_LIGHT} />
    <circle cx="24" cy="27" r="1.8" fill={BRAND_LIGHT} />
    <circle cx="32" cy="27" r="1.8" fill={BRAND_LIGHT} />
    <circle cx="16" cy="33.5" r="1.8" fill={BRAND_LIGHT} />
    <rect x="21" y="30.5" width="6" height="6" rx="2" fill={AMBER} />
  </Svg>
);

export const PhotoIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="5" y="9" width="38" height="30" rx="5" fill={BRAND_LIGHT} />
    <circle cx="33" cy="19" r="4" fill={AMBER} />
    <path d="M5 34l11-12 9 9 6-6 12 11v3a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5Z" fill={BRAND} />
    <path d="M38 3v8M34 7h8" stroke={BRAND_DARK} strokeWidth="2.6" strokeLinecap="round" />
  </Svg>
);

export const ShieldCheckIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10Z" fill="#16A34A" />
    <path d="M24 4l16 6v12c0 10-7 18-16 22Z" fill="#22C55E" />
    <path d="M16 24l6 6 11-12" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const PlotIcon = (p: KlinIconProps) => (
  <Svg {...p}>
    <rect x="5" y="9" width="38" height="25" rx="5" fill="#92400E" />
    <path d="M12 30V21M24 30V19M36 30V21" stroke="#166534" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M12 23c-4 0-6-2-6-5 4 0 6 2 6 5ZM12 23c0-3 2-5 6-5 0 3-2 5-6 5Z" fill="#22C55E" />
    <path d="M24 21c-4 0-6-2-6-5 4 0 6 2 6 5ZM24 21c0-3 2-5 6-5 0 3-2 5-6 5Z" fill="#22C55E" />
    <path d="M36 23c-4 0-6-2-6-5 4 0 6 2 6 5ZM36 23c0-3 2-5 6-5 0 3-2 5-6 5Z" fill="#22C55E" />
    <path d="M8 41h32M11 38l-3 3 3 3M37 38l3 3-3 3" stroke={AMBER} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);
