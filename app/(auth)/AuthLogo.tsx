import Link from "next/link";

// Same logo as the landing page navbar: the K on a purple tab hanging from the top edge.
export default function AuthLogo() {
  return (
    <>
      <Link
        href="/"
        aria-label="Kliner home"
        className="absolute top-0 left-5 sm:left-8 w-[68px] h-[76px] lg:w-[124px] lg:h-[124px] lg:[@media(max-height:820px)]:w-[76px] lg:[@media(max-height:820px)]:h-[76px] bg-brand-600 hover:bg-brand-700 transition-colors text-white flex items-center justify-center"
      >
        <span className="logo-mask aspect-[182/191] h-9 lg:h-16 lg:[@media(max-height:820px)]:h-10" />
      </Link>
      <Link
        href="/"
        className="lg:hidden absolute top-[22px] left-[104px] sm:left-[116px] text-[24px] font-bold tracking-[-0.03em] text-brand-700"
      >
        Kliner
      </Link>
    </>
  );
}
