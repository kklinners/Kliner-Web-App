// The Kliner K as a small, round loader: a spinning ring around a disc with the logo.
// "light" is for purple buttons, "brand" for light backgrounds.
export default function KlinerLoader({
  size = 24,
  tone = "light",
  className = "",
}: {
  size?: number;
  tone?: "light" | "brand";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span className={`absolute inset-0 rounded-full border-2 ${light ? "border-white/30 border-t-white" : "border-brand-600/25 border-t-brand-600"} animate-spin motion-reduce:animate-none`} />
      <span
        className={`flex items-center justify-center rounded-full ${light ? "bg-white text-brand-600" : "bg-brand-600 text-white"}`}
        style={{ width: size - 8, height: size - 8 }}
      >
        <span className="logo-mask aspect-[318/342]" style={{ height: Math.round((size - 8) * 0.58) }} />
      </span>
    </span>
  );
}

// Whole-page loading state: the K, centred, on white.
export function PageLoader({ label = "" }: { label?: string }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4" role="status" aria-label={label || "Loading"}>
      <KlinerLoader size={48} tone="brand" />
      {label && <p className="text-[15px] font-medium text-brand-900/70">{label}</p>}
    </div>
  );
}
