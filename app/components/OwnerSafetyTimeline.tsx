"use client";

import Image from "next/image";
import {
  BELONGINGS_ENTRANCE_NOTICE,
  LIMITED_ACCESS_NOTICE,
  OWNER_STATUS_LABELS,
  ownerTimelineSteps,
  VISIT_CODE_OWNER_HINT,
} from "../../utils/ownerSafety";

type OwnerSecurity = {
  belongingsReminder?: boolean;
  limitedAccessAcknowledged?: boolean;
  accessNotes?: string;
  visitorCode?: string | null;
  showVisitorCode?: boolean;
  teamLeadName?: string | null;
  arrivedAt?: string | null;
  crewCount?: number;
  presentCount?: number;
  workStartedAt?: string | null;
  status?: string;
  completionRequestedAt?: string | null;
  completedAt?: string | null;
  customerPhotos?: { kind: string; at: string; message: string; photos: string[] }[];
  teamAssignedAt?: string | null;
  lastCheckInAt?: string | null;
};

export default function OwnerSafetyTimeline({ security }: { security?: OwnerSecurity | null }) {
  if (!security) return null;

  const steps = ownerTimelineSteps(security);
  const statusLabel = OWNER_STATUS_LABELS[security.status || ""] || security.status;

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 space-y-4">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-wide text-brand-800">Your home · safety</p>
        {statusLabel && (
          <p className="mt-1 text-[15px] font-semibold text-brand-950">{statusLabel}</p>
        )}
      </div>

      <p className="text-[14px] leading-snug text-brand-900/90">
        <span className="font-bold">Belongings: </span>
        {BELONGINGS_ENTRANCE_NOTICE}
      </p>

      {security.limitedAccessAcknowledged && (
        <p className="text-[14px] text-brand-900/85">
          <span className="font-bold">Access: </span>
          {LIMITED_ACCESS_NOTICE}
          {security.accessNotes ? ` ${security.accessNotes}` : ""}
        </p>
      )}

      {security.showVisitorCode && security.visitorCode && (
        <div className="rounded-xl bg-white border-2 border-brand-200 px-4 py-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-brand-600">Visit code</p>
          <p className="text-[28px] font-extrabold tracking-widest text-brand-950 tabular-nums">{security.visitorCode}</p>
          <p className="text-[13px] text-brand-900/70 mt-1 leading-snug">{VISIT_CODE_OWNER_HINT}</p>
        </div>
      )}

      {steps.length > 0 && (
        <ol className="space-y-2 border-t border-brand-100 pt-3">
          {steps.map(([title, detail, at]) => (
            <li key={title} className="flex justify-between gap-3 text-[14px]">
              <span className="font-semibold text-brand-950">{title}</span>
              <span className="text-right text-brand-900/80">
                {detail}
                {at && title !== "Your visit code" ? (
                  <span className="block text-[12px] text-brand-900/50">
                    {new Date(at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      )}

      {security.customerPhotos && security.customerPhotos.length > 0 && (
        <div className="border-t border-brand-100 pt-3">
          <p className="text-[13px] font-bold text-brand-800 mb-2">Before / after photos</p>
          <div className="space-y-3">
            {security.customerPhotos.map((r, i) => (
              <div key={`${r.at}-${i}`}>
                <p className="text-[12px] font-semibold text-brand-700 capitalize">{r.kind} · {new Date(r.at).toLocaleDateString("en-NG")}</p>
                {r.message ? <p className="text-[13px] text-brand-900/80">{r.message}</p> : null}
                {r.photos?.length ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {r.photos.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="relative h-16 w-16 rounded-lg overflow-hidden ring-1 ring-brand-200">
                        <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
