import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "../serviceCatalog";
import { LAUNCH_DISTRICT, SERVICE_AREAS } from "../../../utils/serviceAreas";
import { VENDORS_ENABLED } from "../../../utils/features";
import ScrollAwareHeader from "./ScrollAwareHeader";

const NAV = [
  ["Services", "#services"],
  ["How it works", "#how-it-works"],
  ["Areas", "#areas"],
];

const STEPS = [
  <>
    Pick a service and tell us where in {LAUNCH_DISTRICT}. <strong className="font-extrabold">You see the full price before you pay.</strong>
  </>,
  <>
    Pay securely online through Paystack, <strong className="font-extrabold">with no cash handed over at the door.</strong>
  </>,
  <>
    We assign a <span className="text-brand-300">Kliner team</span> to your job, and you get their name and phone number before they arrive.
  </>,
];

function CheckMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="h-9 w-9 lg:h-11 lg:w-11 shrink-0 text-brand-300">
      <path d="M31.5 19.5a12.5 12.5 0 1 1-6.6-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="m13.5 19 6 7L33 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CHECKS = [
  "We see the owner's ID in person",
  "We call their guarantor",
  "We match the payout account to the business",
  "We visit their office or base",
];

// klin-mark.png is the K from klin-logo.png, cut out of its background: a single-colour mark, so it's used as a mask to take any text colour
function LogoMark({ className = "" }) {
  return (
    <span
      role="img"
      aria-label="Kliner"
      className={`inline-block aspect-[318/342] bg-current ${className}`}
      style={{
        WebkitMaskImage: "url(/klin-mark.png)",
        maskImage: "url(/klin-mark.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

const pill = "inline-flex items-center justify-center rounded-full font-semibold transition-colors";
const gutter = "px-5 sm:px-8 lg:px-[5.5vw]";
const wrap = `mx-auto max-w-[1920px] ${gutter}`;

function Header() {
  return (
    <ScrollAwareHeader>
      {/* Phone and tablet */}
      <div className="lg:hidden">
        <div className="relative h-[84px] flex items-center justify-between pl-[104px] pr-5 sm:pl-[116px] sm:pr-8">
          <Link
            href="/"
            className="fixed top-0 left-5 sm:left-8 w-[68px] h-[76px] group-data-[scrolled=true]:w-[52px] group-data-[scrolled=true]:h-[52px] bg-brand-600 transition-all duration-200 text-white flex items-center justify-center"
          >
            <LogoMark className="h-9 group-data-[scrolled=true]:h-7 transition-all duration-200" />
          </Link>
          <Link href="/" className="text-[24px] font-bold tracking-[-0.03em] text-brand-700">Kliner</Link>
          <Link href="/auth/signin" className={`${pill} h-10 px-5 text-[14px] bg-brand-600 text-white`}>Log in</Link>
        </div>
        <nav
          aria-label="Main"
          className="mx-5 sm:mx-8 flex items-center justify-around gap-0.5 bg-white rounded-full p-1 overflow-x-auto [scrollbar-width:none] shadow-[0_8px_24px_-14px_rgba(25,8,94,0.35)]"
        >
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} className={`${pill} h-9 px-2.5 text-[13px] font-medium text-brand-800 whitespace-nowrap`}>
              {label}
            </Link>
          ))}
          {VENDORS_ENABLED && (
            <Link href="/partners" className={`${pill} h-9 px-3 text-[13px] bg-brand-100 text-brand-800 whitespace-nowrap`}>Vendors</Link>
          )}
        </nav>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <Link
          href="/"
          className="fixed top-0 left-[max(5.5vw,calc(50vw-960px+5.5vw))] w-[124px] h-[124px] group-data-[scrolled=true]:w-[76px] group-data-[scrolled=true]:h-[76px] bg-brand-600 hover:bg-brand-700 transition-all duration-200 text-white flex items-center justify-center"
        >
          <LogoMark className="h-16 group-data-[scrolled=true]:h-10 transition-all duration-200" />
        </Link>

        <div className="flex flex-col items-center pt-7">
          <nav aria-label="Main" className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white rounded-full p-1.5 shadow-[0_8px_24px_-14px_rgba(25,8,94,0.35)]">
              <Link href="/" className={`${pill} h-11 px-5 text-[16px] font-bold text-brand-950`}>Home</Link>
              {NAV.map(([label, href]) => (
                <Link key={href} href={href} className={`${pill} h-11 px-5 text-[16px] font-medium text-brand-800 hover:bg-brand-50`}>
                  {label}
                </Link>
              ))}
              {VENDORS_ENABLED && (
                <Link href="/partners" className={`${pill} h-11 px-5 text-[16px] bg-brand-100 text-brand-800 hover:bg-brand-200`}>
                  For vendors
                </Link>
              )}
            </div>
            <Link href="/auth/signin" className={`${pill} h-[56px] px-7 text-[16px] bg-brand-600 text-white hover:bg-brand-700`}>
              Log in
            </Link>
          </nav>
        </div>
      </div>
    </ScrollAwareHeader>
  );
}

function Hero() {
  return (
    <section
      className={`mx-auto max-w-[1920px] ${gutter} pt-2 lg:pt-0 lg:pb-6 lg:min-h-[calc(100svh-84px)] grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10 items-center`}
    >
      <div className="mt-3 lg:mt-0 text-center lg:text-left">
        <h1 className="text-[28px] sm:text-[36px] lg:text-[clamp(30px,2.75vw,46px)] font-semibold tracking-[-0.022em] leading-[1.14] text-brand-950">
          Book a trusted Kliner team for your home, see the price upfront, and let us handle the rest.
        </h1>
        <p className="mt-3 lg:mt-4 text-[16px] lg:text-[17px] text-brand-900/70">
          Cleaning, laundry, moving, repairs and gardening across {LAUNCH_DISTRICT}.
        </p>
        <div className="mt-6 lg:mt-7 grid grid-cols-2 lg:flex lg:flex-wrap gap-2.5">
          <Link href="#services" className={`${pill} h-[52px] px-4 lg:px-7 text-[16px] lg:text-[17px] whitespace-nowrap bg-brand-100 text-brand-800 hover:bg-brand-200`}>
            See services
          </Link>
          <Link href="/auth/signup" className={`${pill} h-[52px] px-4 lg:px-7 text-[16px] lg:text-[17px] whitespace-nowrap bg-brand-600 text-white hover:bg-brand-700`}>
            Book a clean
          </Link>
        </div>
      </div>

      {/* The whole house stays in view: never wider than its column or taller than the screen */}
      <Image
        src="/landing/kliner-house-v3.png"
        alt="Cut-away view of a house with Kliner cleaners vacuuming, mopping and washing windows, and a Kliner van parked outside"
        width={2520}
        height={1464}
        priority
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="order-first lg:order-none -mx-5 sm:-mx-8 lg:mx-0 w-screen max-w-none lg:w-full lg:max-w-full h-auto lg:max-h-[calc(100svh-200px)] object-contain"
      />
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="scroll-mt-6 mt-12 lg:mt-0 bg-brand-100">
      <div className={`${wrap} py-12 lg:py-24 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6 lg:gap-16`}>
        <div>
          <h2 className="text-[26px] lg:text-[36px] font-semibold tracking-[-0.02em] leading-tight text-brand-950">
            What we can do for your home
          </h2>
          <p className="mt-2 lg:mt-3 text-[15px] lg:text-[16px] text-brand-900/70 max-w-sm">
            The final price depends on your home and what you choose. You&apos;ll see it before you pay.
          </p>
          {/* Desktop only: fills the space beside the service list */}
          <Image
            src="/landing/kliner-services-v3.png"
            alt="A room with a Kliner cleaner mopping, surrounded by a toolbox, plant, washing machine and moving boxes"
            width={1800}
            height={1289}
            sizes="30vw"
            className="hidden lg:block mt-10 w-full h-auto"
          />
        </div>
        <ul className="space-y-2.5 lg:space-y-0 lg:border-t lg:border-brand-900/15">
          {SERVICES.map(({ name, Icon, price, description }) => (
            <li key={name} className="lg:border-b lg:border-brand-900/15">
              <Link href="/auth/signup" className="group flex items-center gap-3.5 sm:gap-6 bg-white lg:bg-transparent rounded-2xl lg:rounded-none p-3 lg:px-0 lg:py-5">
                <span className="h-14 w-14 shrink-0 rounded-xl lg:rounded-2xl bg-brand-50 lg:bg-white flex items-center justify-center">
                  <Icon size={36} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] lg:text-[19px] font-semibold text-brand-950">{name}</span>
                  <span className="hidden sm:block text-[15px] text-brand-900/70">{description}</span>
                </span>
                <span className="shrink-0 pr-1 lg:pr-0 text-right text-[14px] lg:text-[15px] font-semibold text-brand-800 whitespace-nowrap">{price}</span>
                <ArrowRight size={18} className="hidden sm:block shrink-0 text-brand-600 transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Winding line runs behind the cards. preserveAspectRatio="none" lets it stretch with
// the section, and non-scaling-stroke keeps its thickness even while it does.
const CHECK_TILTS = ["lg:-rotate-[1.5deg]", "lg:rotate-[1.2deg]", "lg:rotate-[1deg]", "lg:-rotate-[1.2deg]"];

function WindingLine({ d, className }: { d: string; className: string }) {
  return (
    <svg viewBox="0 0 1000 1200" preserveAspectRatio="none" aria-hidden="true" className={`absolute inset-0 h-full w-full text-white ${className}`}>
      <path d={d} fill="none" stroke="currentColor" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="[stroke-width:12px] lg:[stroke-width:20px]" />
    </svg>
  );
}

function Verified() {
  return (
    <div className="mt-5 lg:mt-8 bg-brand-600 text-white rounded-[28px] px-6 py-12 sm:px-10 sm:py-16 lg:px-[7%] lg:py-24 overflow-hidden">
      <div className="max-w-3xl mx-auto text-center">
        <h3 className="text-[38px] sm:text-[52px] lg:text-[clamp(52px,5.4vw,84px)] font-extrabold tracking-[-0.035em] leading-[1.04]">
          What &ldquo;verified&rdquo; means at Kliner
        </h3>
        <p className="mt-4 lg:mt-5 text-[16px] lg:text-[clamp(17px,1.45vw,22px)] leading-[1.4] text-white/80">
          A company can&apos;t receive a job from us until these checks are done.
        </p>
      </div>

      <div className="relative mt-10 lg:mt-14 pb-20 lg:pb-24">
        <WindingLine className="lg:hidden" d="M500 16 C500 70 860 70 860 150 C860 250 140 250 140 450 C140 590 860 570 860 750 C860 900 140 880 140 1000 C140 1110 500 1090 500 1160" />
        <WindingLine className="hidden lg:block" d="M620 16 C610 70 420 40 300 140 C430 250 790 110 900 230 C970 310 860 380 720 440 C560 530 200 400 90 530 C30 620 170 700 300 740 C470 830 830 700 920 830 C980 930 850 990 720 1030 C610 1090 500 1090 500 1160" />

        <ol className="relative grid gap-12 lg:gap-0 lg:grid-rows-4 lg:h-[clamp(860px,76vw,1180px)]">
          {CHECKS.map((check, i) => (
            <li
              key={check}
              className={`${i % 2 ? "ml-5 sm:ml-16 lg:ml-0 lg:justify-self-end" : "mr-5 sm:mr-16 lg:mr-0 lg:justify-self-start"} ${CHECK_TILTS[i]} lg:self-center lg:w-[52%] bg-brand-950 rounded-3xl p-6 sm:p-7 lg:p-[clamp(28px,3vw,44px)]`}
            >
              <span className="block text-[40px] lg:text-[clamp(44px,4.4vw,68px)] font-extrabold leading-none tracking-[-0.03em] text-brand-300">{i + 1}</span>
              <p className="mt-4 lg:mt-6 text-[24px] sm:text-[28px] lg:text-[clamp(26px,2.7vw,42px)] font-extrabold tracking-[-0.025em] leading-[1.1]">{check}</p>
            </li>
          ))}
        </ol>

        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-16 w-16 lg:h-20 lg:w-20 rounded-full bg-white text-brand-600 flex items-center justify-center" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 lg:h-10 lg:w-10">
            <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className={`${wrap} scroll-mt-6 pt-14 lg:pt-28`}>
      <div className="bg-brand-950 text-white rounded-[28px] px-6 py-10 sm:px-10 sm:py-14 lg:px-[7%] lg:py-24 grid lg:grid-cols-2 gap-9 lg:gap-16 items-center">
        <h2 className="text-[44px] sm:text-[56px] lg:text-[clamp(52px,5.4vw,84px)] font-extrabold tracking-[-0.035em] leading-[1.04]">
          How it
          <br />
          works <span className="text-brand-300">for you</span>
        </h2>
        <ol className="space-y-7 lg:space-y-10">
          {STEPS.map((step, i) => (
            <li key={i} className="flex items-center gap-4 lg:gap-5 text-[16px] lg:text-[clamp(17px,1.45vw,22px)] leading-[1.4]">
              <CheckMark />
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {VENDORS_ENABLED && <Verified />}
    </section>
  );
}

function Areas() {
  return (
    <section id="areas" className={`${wrap} scroll-mt-6 py-14 lg:py-28`}>
      <h2 className="text-[26px] lg:text-[36px] font-semibold tracking-[-0.02em] leading-tight text-brand-950">
        Now serving {LAUNCH_DISTRICT}
      </h2>
      <ul className="mt-5 lg:mt-7 flex flex-wrap gap-2">
        {SERVICE_AREAS.map((area) => (
          <li key={area} className="rounded-full bg-white px-3.5 lg:px-4 py-1.5 lg:py-2 text-[14px] lg:text-[15px] font-medium text-brand-800">{area}</li>
        ))}
      </ul>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-brand-700 text-white">
      {VENDORS_ENABLED && (
      <div className={`${wrap} py-12 lg:py-16 flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div>
          <p className="text-[26px] lg:text-[32px] font-semibold tracking-[-0.02em] leading-tight">Own a cleaning company in {LAUNCH_DISTRICT}?</p>
          <p className="mt-1.5 text-[16px] text-white/75">Join Kliner as a verified partner and get paid jobs near you.</p>
        </div>
        <Link href="/partners" className={`${pill} h-[52px] px-7 text-[17px] bg-white text-brand-800 hover:bg-brand-100 shrink-0 self-start md:self-auto`}>
          Become a vendor
        </Link>
      </div>
      )}
      <div className={`${wrap} ${VENDORS_ENABLED ? "pb-8" : "py-8"}`}>
        <div className={`${VENDORS_ENABLED ? "border-t border-white/20 pt-6" : ""} flex items-center justify-between gap-4 text-[14px] text-white/75`}>
          <span className="flex items-center gap-2 text-white font-bold text-[17px]">
            <LogoMark className="h-5" /> Kliner
          </span>
          <span>© {new Date().getFullYear()} Kliner</span>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#EFEDE8] overflow-x-clip">
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <Areas />
      </main>
      <Footer />
    </div>
  );
}
