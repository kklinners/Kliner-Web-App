// Team field job page: WhatsApp handoff + facility rules shown to cleaners.

import {
  BELONGINGS_TEAM_NOTICE,
  LIMITED_ACCESS_NOTICE,
  VISIT_CODE_TEAM_INSTRUCTION,
} from "./ownerSafety";

/** @deprecated use BELONGINGS_TEAM_NOTICE from ownerSafety */
export const BELONGINGS_ENTRANCE_NOTICE = BELONGINGS_TEAM_NOTICE;

const internationalPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 10) return "";
  return digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
};

/** Open WhatsApp chat with a team member (their number, not Kliner support). */
export const teamWhatsAppLink = (phone, message = "") => {
  const to = internationalPhone(phone);
  if (!to) return null;
  return `https://wa.me/${to}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
};

const formatJobWhen = (bookingDate, bookingTime) => {
  const day = bookingDate
    ? new Date(bookingDate).toLocaleDateString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBC";
  return `${day}${bookingTime ? ` at ${bookingTime}` : ""}`;
};

/**
 * Pre-filled WhatsApp text after admin assigns a team: job summary + private page login + rules.
 * Visit code is intentionally omitted — only the property owner sees it in the app.
 */
export const teamJobWhatsAppMessage = ({
  teamName = "team",
  serviceCategory = "Cleaning job",
  bookingDate,
  bookingTime,
  location = "",
  fieldUrl,
  accessNotes = "",
}) => {
  const lines = [
    `Hi ${teamName},`,
    "",
    "You've been assigned a Kliner job for a property owner.",
    "",
    `Service: ${serviceCategory}`,
    `When: ${formatJobWhen(bookingDate, bookingTime)}`,
    location ? `Where: ${location}` : "",
    "",
    "YOUR LOGIN (private job page — do not share):",
    fieldUrl,
    "",
    "On that page:",
    `• ${VISIT_CODE_TEAM_INSTRUCTION}`,
    "• Each crew member confirms presence",
    "• Post updates and before/after photos",
    "• Request completion when done",
    "",
    "PROPERTY OWNER SAFETY:",
    `• ${BELONGINGS_TEAM_NOTICE}`,
    `• ${LIMITED_ACCESS_NOTICE}`,
    accessNotes ? `• Customer note: ${accessNotes}` : "",
    "",
    "— Kliner",
  ].filter(Boolean);
  return lines.join("\n");
};

export const fieldJobUrl = (fieldToken, origin) =>
  fieldToken ? `${origin || (typeof window !== "undefined" ? window.location.origin : "")}/team/${fieldToken}` : "";
