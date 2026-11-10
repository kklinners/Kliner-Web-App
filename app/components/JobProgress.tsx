"use client";

import { useEffect, useState } from "react";
import { STAGES, jobProgress, timeLeftText } from "../../utils/jobProgress";

// Live progress for a job that has been started. It moves with the clock and waits at
// "finishing up" until the team's admin marks the job completed.
export default function JobProgress({
  startedAt,
  expectedMinutes,
  clockOffset = 0,
  compact = false,
}: {
  startedAt: string;
  expectedMinutes: number;
  clockOffset?: number; // server time minus this device's time, so a wrong phone clock doesn't matter
  compact?: boolean;
}) {
  const [now, setNow] = useState(() => Date.now() + clockOffset);
  useEffect(() => {
    setNow(Date.now() + clockOffset);
    const timer = setInterval(() => setNow(Date.now() + clockOffset), 15000);
    return () => clearInterval(timer);
  }, [clockOffset]);

  const p = jobProgress({ startedAt, expectedMinutes, now });
  const stageLabel = STAGES[p.stageIndex][1];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-bold text-brand-950">{p.overdue ? "Finishing up" : stageLabel}</p>
        <p className="text-[13px] text-brand-900/70 text-right">{timeLeftText(p)}</p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={p.percent}
        aria-valuetext={`${stageLabel}. ${timeLeftText(p)}`}
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-brand-100"
      >
        <div className="h-full rounded-full bg-brand-600 transition-[width] duration-700" style={{ width: `${p.percent}%` }} />
      </div>
      {!compact && (
        <>
          <ol className="mt-3 grid grid-cols-4 gap-1 text-[12px]">
            {STAGES.map(([key, label], i) => (
              <li key={key} className={i <= p.stageIndex ? "font-bold text-brand-700" : "text-brand-900/40"}>
                {label}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[12px] text-brand-900/60">This moves as the work goes on. Your team sends updates and Kliner confirms when the job is done.</p>
        </>
      )}
    </div>
  );
}
