"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNavigation from "../../components/BottomNavigation";
import { httpClient } from "../../../utils/httpClient";
import { isAuthenticated } from "../../../utils/tokenService";
import { hasContact, phoneLink, whatsappLink, PHONE_NUMBER } from "../../../utils/contact";
import { LAUNCH_DISTRICT, SERVICE_AREAS } from "../../../utils/serviceAreas";
import {
  BELONGINGS_ENTRANCE_NOTICE,
  LIMITED_ACCESS_NOTICE,
  VISIT_CODE_OWNER_HINT,
} from "../../../utils/ownerSafety";
import OwnerIssueForm from "../../components/OwnerIssueForm";

// A job's status is shown only once the work has started
const STATUS = {
  accepted: "Team assigned",
  in_progress: "In progress",
  completion_requested: "Confirming completion",
  completed: "Completed",
  cancelled: "Cancelled",
};

const QUESTIONS = [
  ["How do you protect my belongings?", BELONGINGS_ENTRANCE_NOTICE],
  ["Which rooms can the team enter?", LIMITED_ACCESS_NOTICE + " You can list included areas when you pay."],
  ["What is the visit code?", `After we assign your team, a 6-digit code appears in My Bookings. ${VISIT_CODE_OWNER_HINT}`],
  ["How is the price worked out?", "It depends on the service you pick and the details you enter, such as home size, rooms and how often. You see the full price on the summary page before you pay."],
  ["How do I pay?", "Online through Paystack when you confirm your booking. Nobody collects cash at the door."],
  ["How do I find out who is coming?", "Once you've paid, we assign a Kliner team to your booking. Their name and phone number then appear on your booking in My Bookings."],
  ["Where do you work?", `Right now only in ${LAUNCH_DISTRICT}: ${SERVICE_AREAS.join(", ")}.`],
  ["What can I book?", "Cleaning, laundry, moving, repairs and gardening."],
  [
    "I paid but my booking still says pending",
    `Stay on the Paystack page until it sends you back to Kliner. That's the moment your payment is confirmed. Open My Bookings to check.${hasContact ? " If it still says pending, message us with your payment reference from the Paystack receipt." : ""}`,
  ],
];

const rowClass = "border-b border-brand-900/15";
const shortDate = (d) => (d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "");

function Title({ children }) {
  return <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-brand-950 border-b-2 border-brand-950 pb-2.5">{children}</h2>;
}

export default function HelpPage() {
  const [bookings, setBookings] = useState([]);
  const wa = whatsappLink("Hi Kliner, I need some help.");
  const call = phoneLink();

  useEffect(() => {
    if (!isAuthenticated()) return;
    httpClient
      .get("/api/v1/services/my-services")
      .then(({ data }) => setBookings((data.data?.services || []).slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white lg:pl-56 pb-28 lg:pb-16">
      <BottomNavigation />

      <main className="max-w-[640px] px-5 sm:px-8 mx-auto lg:mx-0 lg:ml-[6vw] pt-10 lg:pt-16">
        <h1 className="text-[38px] sm:text-[52px] font-semibold tracking-[-0.03em] leading-[1.05] text-brand-950">Help</h1>
        <p className="mt-3 text-[16px] text-brand-900/70">Answers first, and a person if you need one.</p>

        <section className="mt-12">
          <Title>Talk to us</Title>
          {hasContact ? (
            <>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className={`${rowClass} flex items-center justify-between min-h-[60px]`}>
                  <span className="text-[16px] font-semibold text-brand-950">Message us on WhatsApp</span>
                  <span className="text-[15px] font-semibold text-brand-700">Open</span>
                </a>
              )}
              {call && (
                <a href={call} className={`${rowClass} flex items-center justify-between min-h-[60px]`}>
                  <span className="text-[16px] font-semibold text-brand-950">Call {PHONE_NUMBER}</span>
                  <span className="text-[15px] font-semibold text-brand-700">Call</span>
                </a>
              )}
            </>
          ) : (
            <p className="py-4 text-[15px] text-brand-900/70 border-b border-brand-900/15">
              Once your team is assigned, their name and phone number appear on your booking in My Bookings.
            </p>
          )}
        </section>

        {bookings.length > 0 && (
          <section className="mt-12">
            <Title>Your bookings</Title>
            {bookings.map((b) => {
              const note = `Hi Kliner, I need help with my ${b.serviceName} booking on ${shortDate(b.bookingDate)} (ref ${b.service_id}).`;
              const link = whatsappLink(note);
              return (
                <div key={b.id} className={`${rowClass} py-4`}>
                  {b.paymentStatus === "paid" && ["accepted", "in_progress", "completion_requested", "completed"].includes(b.status) && (
                    <OwnerIssueForm bookingId={b.id} serviceName={b.serviceName} />
                  )}
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[16px] font-semibold text-brand-950">
                      {b.serviceName} <span className="font-medium text-brand-900/60">· {shortDate(b.bookingDate)}</span>
                    </p>
                    <p className="text-[14px] text-brand-900/70 text-right shrink-0">{STATUS[b.status] || ""}</p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[15px] font-semibold">
                    {b.partnerName && (
                      <span className="text-brand-950">
                        Your team: {b.partnerName}
                        {b.partnerPhone && (
                          <>
                            {" "}
                            <a href={`tel:${b.partnerPhone}`} className="text-brand-700 underline underline-offset-4">
                              Call
                            </a>
                          </>
                        )}
                      </span>
                    )}
                    {link && (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline underline-offset-4">
                        Ask us about this
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            <Link href="/booking/bookings" className="inline-block mt-4 text-[15px] font-semibold text-brand-700 underline underline-offset-4">
              All bookings
            </Link>
          </section>
        )}

        <section className="mt-12">
          <Title>Common questions</Title>
          {QUESTIONS.map(([q, a]) => (
            <details key={q} className={`group ${rowClass}`}>
              <summary className="flex items-center justify-between gap-4 min-h-[60px] cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-[16px] font-semibold text-brand-950">{q}</span>
                <span className="text-[22px] leading-none text-brand-700 group-open:hidden" aria-hidden="true">+</span>
                <span className="text-[22px] leading-none text-brand-700 hidden group-open:block" aria-hidden="true">−</span>
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-brand-900/80 max-w-[54ch]">{a}</p>
            </details>
          ))}
        </section>
      </main>
    </div>
  );
}
