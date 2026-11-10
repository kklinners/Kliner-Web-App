// Property-owner safety: copy, policies, and customer-facing status labels.

export const BELONGINGS_ENTRANCE_NOTICE =
  "Keep personal belongings at the entrance of the home. Our team will not move your items into the work area.";

export const BELONGINGS_TEAM_NOTICE =
  "All personal belongings must stay at the entrance of the facility before work begins. Do not move the customer's items into the work area.";

export const LIMITED_ACCESS_NOTICE =
  "Only the rooms or areas included in this booking should be accessed. Do not enter other parts of the property.";

export const LIABILITY_NOTICE =
  "Kliner assigns verified in-house teams. If anything is damaged or missing, contact us from Help with your booking reference — we will investigate using arrival logs, crew check-ins, and field updates.";

export const COMPLETION_PENDING_LABEL =
  "Your team has finished on site. Kliner is reviewing updates before we mark the job complete.";

export const PRE_ARRIVAL_NOTICE =
  "Your Kliner team is assigned for today. They will log arrival on site and confirm each crew member before work starts.";

/** Shown next to the visit code in the customer app — owner is the source of truth at the door. */
export const VISIT_CODE_OWNER_HINT =
  "Only give this code when your team is at the door. They must enter it on their Kliner job page before work starts. Do not send it in group chats or social media.";

export const VISIT_CODE_OWNER_HINT_SHORT = "Share only at the door when your team arrives.";

/** What crews hear via WhatsApp — no digits; owner holds the code in the app. */
export const VISIT_CODE_TEAM_INSTRUCTION =
  "At the property, ask the owner for the 6-digit visit code in their Kliner app (My Bookings). Enter it on your job page, then record arrival.";

export const OWNER_STATUS_LABELS = {
  pending: "Awaiting payment",
  confirmed: "Finding your team",
  assigned: "Team being assigned",
  accepted: "Team assigned",
  in_progress: "Work in progress",
  completion_requested: "Team finished — Kliner confirming",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ownerTimelineSteps(security) {
  if (!security) return [];
  const steps = [];
  if (security.teamLeadName) steps.push(["Team lead", security.teamLeadName, security.teamAssignedAt]);
  if (security.visitorCode && security.showVisitorCode) {
    steps.push(["Your visit code", security.visitorCode, null]);
  }
  if (security.arrivedAt) steps.push(["Team arrived", formatWhen(security.arrivedAt), security.arrivedAt]);
  if (security.crewCount > 0) {
    steps.push([
      "Crew on site",
      `${security.presentCount} of ${security.crewCount} confirmed present`,
      security.lastCheckInAt,
    ]);
  }
  if (security.workStartedAt) steps.push(["Work started", formatWhen(security.workStartedAt), security.workStartedAt]);
  if (security.status === "completion_requested") {
    steps.push(["Awaiting Kliner sign-off", "We are reviewing the job", security.completionRequestedAt]);
  }
  if (security.status === "completed") steps.push(["Completed", formatWhen(security.completedAt), security.completedAt]);
  return steps;
}

function formatWhen(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}
