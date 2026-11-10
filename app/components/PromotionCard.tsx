import { THEMES, artSrc } from "../../utils/promotions";

// One banner. Used on the home screen and as the live preview in the admin editor.
export default function PromotionCard({ promo, onBook = null }: { promo: any; onBook?: (() => void) | null }) {
  const theme = THEMES[promo.theme] || THEMES.purple;
  const art = artSrc(promo.art);
  const badge = (promo.badge || "").trim();
  return (
    <div style={{ backgroundColor: theme.color }} className="relative flex min-h-[176px] overflow-hidden rounded-2xl text-white">
      <div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-7">
        {badge && <p className="text-[38px] sm:text-[52px] font-extrabold tracking-[-0.03em] leading-none break-words">{badge}</p>}
        <h3 className={`${badge ? "mt-2 text-[18px] sm:text-[22px]" : "text-[26px] sm:text-[36px]"} font-bold tracking-[-0.02em] leading-tight break-words`}>
          {promo.title || "Your title"}
        </h3>
        {promo.description && <p className="mt-1.5 max-w-[30ch] whitespace-pre-line text-[14px] sm:text-[16px] leading-snug text-white/85">{promo.description}</p>}
        {onBook && promo.service && (
          <button type="button" onClick={onBook} className="mt-4 h-10 self-start rounded-full bg-white px-5 text-[14px] font-bold text-brand-700 transition-colors hover:bg-brand-50">
            Book now
          </button>
        )}
      </div>
      {art && (
        <div className="m-3 w-[38%] shrink-0 overflow-hidden rounded-xl bg-[#EFEDE8] sm:w-[36%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art} alt="" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
}
