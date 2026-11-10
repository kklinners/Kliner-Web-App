import BottomNavigation from "../../../components/BottomNavigation";

export default function BookingsLayout({ children }) {
  return (
    <div className="lg:pl-56 pb-16 lg:pb-0">
      {children}
      <BottomNavigation />
    </div>
  );
}
