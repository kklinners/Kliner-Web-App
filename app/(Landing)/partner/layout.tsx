import { redirect } from "next/navigation";
import { VENDORS_ENABLED } from "../../../utils/features";

export default function VendorAreaLayout({ children }) {
  if (!VENDORS_ENABLED) redirect("/");
  return children;
}
