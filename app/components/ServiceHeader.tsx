"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const WIDTHS = {
  default: "max-w-[1280px] px-5 sm:px-8",
  narrow: "max-w-3xl px-4 md:px-6 lg:px-8",
  medium: "max-w-5xl px-4",
  wide: "max-w-6xl px-4",
};

// The page title in Kliner's style: big, bold, tight.
export function PageTitle({ title, subtitle = "", action = null, width = "default", compact = false }) {
  return (
    <div className={`mx-auto ${WIDTHS[width]} ${compact ? "pt-0" : "pt-8 lg:pt-12"} pb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between`}>
      {/* On phones the action sits under the title; the title scales smoothly with the screen */}
      <div className="min-w-0 max-w-full">
        <h1 className="text-[clamp(30px,8vw,44px)] font-extrabold tracking-[-0.035em] leading-[1.05] text-brand-950 [overflow-wrap:break-word]">{title}</h1>
        {subtitle && <p className="mt-2 text-[clamp(14px,3.8vw,16px)] leading-snug text-brand-900/70">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// Top of a page: the Kliner K on the purple tab, a way back, then the title.
// Pages that already have the side menu skip the tab (tab={false}) and only get the title.
export default function ServiceHeader({
  title = "",
  subtitle = "",
  width = "default",
  tab = true,
  action = null,
}: {
  title?: string;
  subtitle?: string;
  width?: keyof typeof WIDTHS;
  tab?: boolean;
  action?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <>
      {tab && (
        <header className={`mx-auto ${WIDTHS[width]} h-[84px] flex items-start justify-between`}>
          <Link href="/" aria-label="Kliner home" className="w-[68px] h-[76px] bg-brand-600 hover:bg-brand-700 transition-colors text-white flex items-center justify-center">
            <span role="img" aria-label="Kliner" className="logo-mask aspect-[318/342] h-9" />
          </Link>
          <button type="button" onClick={() => router.back()} className="mt-4 h-11 px-4 -mr-4 text-[15px] font-semibold text-brand-800 hover:text-brand-950">
            ← Back
          </button>
        </header>
      )}
      {title && <PageTitle title={title} subtitle={subtitle} action={action} width={width} compact={tab} />}
    </>
  );
}
