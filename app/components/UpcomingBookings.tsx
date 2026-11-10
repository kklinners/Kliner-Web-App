import Link from "next/link";
import JobProgress from "./JobProgress";
import { VISIT_CODE_OWNER_HINT_SHORT } from "../../utils/ownerSafety";

const when = (b) => {
  const day = new Date(b.bookingDate);
  const today = new Date();
  const sameDay = (a, c) => a.toDateString() === c.toDateString();
  const tomorrow = new Date(today.getTime() + 86400000);
  const label = sameDay(day, today) ? "Today" : sameDay(day, tomorrow) ? "Tomorrow" : day.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
  return `${label}${b.bookingTime ? `, ${b.bookingTime}` : ""}`;
};

// The customer's real next bookings. Nothing is shown unless they have one.
export default function UpcomingBookings({ bookings, showEmpty = false, clockOffset = 0 }: { bookings: any[]; showEmpty?: boolean; clockOffset?: number }) {
  if (!bookings.length && !showEmpty) return null;
  return (
    <section aria-label="Coming up">
      <h2 className="border-b-2 border-brand-950 pb-2 text-[18px] font-bold tracking-[-0.02em] text-brand-950">Coming up</h2>
      {bookings.length ? (
        <>
          {bookings.map((b) => (
            <Link key={b.id} href="/booking/bookings" className="block border-b border-brand-900/15 py-3.5">
              <p className="text-[16px] font-semibold text-brand-950">{b.serviceCategory || b.serviceName}</p>
              <p className="text-[14px] text-brand-900/70">{when(b)}</p>
              {/* Status only appears once the work has started */}
              {["in_progress", "completion_requested"].includes(b.status) && b.progress?.startedAt ? (
                <div className="mt-2">
                  <JobProgress startedAt={b.progress.startedAt} expectedMinutes={b.progress.expectedMinutes} clockOffset={clockOffset} compact />
                </div>
              ) : (
                <>
                  {b.partnerName && <p className="mt-0.5 text-[13px] font-semibold text-brand-700">Your team: {b.partnerName}</p>}
                  {b.ownerSecurity?.showVisitorCode && b.ownerSecurity?.visitorCode && (
                    <p className="mt-1.5 text-[13px] text-brand-900/80">
                      Visit code:{" "}
                      <span className="font-bold tracking-widest tabular-nums">{b.ownerSecurity.visitorCode}</span>
                      <span className="block mt-0.5 text-[12px] font-normal text-brand-900/65">{VISIT_CODE_OWNER_HINT_SHORT}</span>
                    </p>
                  )}
                </>
              )}
            </Link>
          ))}
          <Link href="/booking/bookings" className="mt-3 inline-block text-[14px] font-semibold text-brand-700 underline underline-offset-4">
            All bookings
          </Link>
        </>
      ) : (
        <p className="py-4 text-[14px] text-brand-900/70">Nothing booked yet. Pick a service to get started.</p>
      )}
    </section>
  );
}
