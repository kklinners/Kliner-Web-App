// How far along a started job is, from the time it started and how long it is expected to take.
// Only an admin completes a job, so this never reaches 100%: it stops at "finishing up".
export const MAX_AUTO_PERCENT = 95;

export const STAGES = [
  ["started", "Started"],
  ["working", "Working"],
  ["nearly", "Nearly there"],
  ["finishing", "Finishing up"],
];

export function jobProgress({ startedAt, expectedMinutes, now = Date.now() }) {
  const started = new Date(startedAt).getTime();
  const total = Math.max(1, Number(expectedMinutes) || 1) * 60000;
  const elapsed = Math.max(0, now - started);
  const ratio = elapsed / total;
  const overdue = ratio >= 1;
  const stage = overdue ? "finishing" : ratio < 0.1 ? "started" : ratio < 0.6 ? "working" : ratio < 0.9 ? "nearly" : "finishing";
  return {
    percent: Math.max(4, Math.min(MAX_AUTO_PERCENT, Math.round(ratio * 100))),
    stage,
    stageIndex: STAGES.findIndex(([key]) => key === stage),
    overdue,
    minutesLeft: Math.max(0, Math.ceil((total - elapsed) / 60000)),
    elapsedMinutes: Math.floor(elapsed / 60000),
  };
}

export const formatDuration = (minutes) => {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
};

export const timeLeftText = (p) => (p.overdue ? "Taking a little longer than planned. Your team will finish soon." : `About ${formatDuration(p.minutesLeft)} left`);
