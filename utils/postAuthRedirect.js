// Remembers where to send someone after they finish signing up / logging in
// (e.g. vendors who start on /partners go to the application form, not the
// customer home page). Survives the signup → OTP → login steps.

import { httpClient } from "./httpClient";
import { VENDORS_ENABLED } from "./features";

const KEY = "post_auth_redirect";
const APPLY_PATH = "/partners/apply";

// Only allow internal paths like "/partners/apply" (never "//evil.com" or URLs)
const isSafePath = (path) =>
  typeof path === "string" && path.startsWith("/") && !path.startsWith("//");

export const setPostAuthRedirect = (path) => {
  try {
    if (isSafePath(path)) localStorage.setItem(KEY, path);
  } catch {}
};

/** Returns the saved path (and clears it), or null. */
export const takePostAuthRedirect = () => {
  try {
    const path = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return isSafePath(path) ? path : null;
  } catch {
    return null;
  }
};

/**
 * Where to go right after login. Must be called once the token is saved, since
 * it asks the API whether this account has a vendor application. Vendors can't
 * be spotted by role alone: they stay "user" until they are verified.
 */
export const resolvePostLoginPath = async ({ role, profileComplete }) => {
  const saved = takePostAuthRedirect();
  // A specific page (e.g. /admin) beats the default; the application form doesn't,
  // because someone who has already applied belongs on their dashboard.
  if (saved && saved !== APPLY_PATH) return saved;
  if (role === "admin") return "/admin";
  if (!VENDORS_ENABLED) return profileComplete ? "/" : "/complete-profile";

  let status = null;
  try {
    const { data } = await httpClient.get("/api/v1/partners/me");
    status = data.data?.status || null;
  } catch {
    // Can't tell, so fall through to the normal customer routing
  }
  if (status === "rejected" && saved) return saved; // they came back to re-apply
  if (status || role === "provider") return "/partner";

  if (saved) return saved;
  return profileComplete ? "/" : "/complete-profile";
};

export const peekPostAuthRedirect = () => {
  try {
    const path = localStorage.getItem(KEY);
    return isSafePath(path) ? path : null;
  } catch {
    return null;
  }
};
