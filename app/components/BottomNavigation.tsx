"use client";
import { usePathname } from "next/navigation";
import { HomeNavIcon, BookingsNavIcon, HelpNavIcon, UserIcon } from "./icons/KlinIcons";
import { useAuth } from "../../context/AuthContext";

export default function BottomNavigation() {
  const { logout } = useAuth();
  const pathname = usePathname();

  const mobileLink = (href) =>
    `flex flex-col items-center ${pathname === href ? "text-brand-600" : "text-gray-400"}`;
  // Two-tone icons keep their colour; the page you are not on is faded
  const dim = (href) => (pathname === href ? "" : "opacity-45 saturate-50");
  const desktopLink = (href) =>
    `flex items-center p-2 rounded-lg ${
      pathname === href ? "bg-brand-100 text-brand-600" : "hover:bg-gray-100 text-gray-500"
    }`;

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Bottom Navigation - Icons Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 max-w-5xl mx-auto lg:hidden z-10">
        <a href="/" className={mobileLink("/")}>
          <HomeNavIcon size={26} className={dim("/")} />
        </a>

        <a
          href="/booking/bookings"
          className={mobileLink("/booking/bookings")}
        >
          <BookingsNavIcon size={26} className={dim("/booking/bookings")} />
        </a>

        <a
          href="/help"
          className={mobileLink("/help")}
        >
          <HelpNavIcon size={26} className={dim("/help")} />
        </a>

        <a href="/profile" className={mobileLink("/profile")}>
          <UserIcon size={26} className={dim("/profile")} />
        </a>
      </div>

      {/* Desktop Side Navigation - Icons with Text */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-56 bg-white border-r shadow-sm">
        <div className="flex flex-col items-center py-8 h-full">
          <div className="mb-8 flex items-center">
            <span role="img" aria-label="Kliner" className="logo-mask aspect-[318/342] h-8 text-brand-600" />
            <span className="ml-3 text-lg font-semibold text-brand-600">
              Kliner
            </span>
          </div>

          <nav className="flex flex-col w-full px-4 space-y-4 flex-grow">
            <a
              href="/"
              className={desktopLink("/")}
            >
              <HomeNavIcon size={28} className={dim("/")} />
              <span className="ml-3">Home</span>
            </a>

            <a
              href="/booking/bookings"
              className={desktopLink("/booking/bookings")}
            >
              <BookingsNavIcon size={28} className={dim("/booking/bookings")} />
              <span className="ml-3">Bookings</span>
            </a>

            <a
              href="/help"
              className={desktopLink("/help")}
            >
              <HelpNavIcon size={28} className={dim("/help")} />
              <span className="ml-3">Help</span>
            </a>

            <a
              href="/profile"
              className={desktopLink("/profile")}
            >
              <UserIcon size={28} className={dim("/profile")} />
              <span className="ml-3">Profile</span>
            </a>
          </nav>

          <div className="mt-auto mb-8 w-full px-4">
            <button
              onClick={handleLogout}
              className="flex items-center p-2 rounded-lg hover:bg-red-50 text-red-500 w-full transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
