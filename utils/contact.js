// How customers reach Kliner. Fill these in and the contact buttons on the Help page and
// the booking page switch on; while they're empty those buttons stay hidden.
// Either style works: "08012345678" or "+234 801 234 5678".
export const WHATSAPP_NUMBER = "";
export const PHONE_NUMBER = "";

// Everything is turned into international digits (Nigerian 0801… becomes 234801…)
const international = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
};

export const hasContact = Boolean(international(WHATSAPP_NUMBER) || international(PHONE_NUMBER));

export const whatsappLink = (message = "") =>
  international(WHATSAPP_NUMBER)
    ? `https://wa.me/${international(WHATSAPP_NUMBER)}${message ? `?text=${encodeURIComponent(message)}` : ""}`
    : null;

export const phoneLink = () => (international(PHONE_NUMBER) ? `tel:+${international(PHONE_NUMBER)}` : null);
