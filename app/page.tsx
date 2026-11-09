import { cookies } from "next/headers";
import CustomerHome from "./components/CustomerHome";
import Landing from "./components/landing/Landing";

// Visitors get the marketing page; anyone signed in goes straight to the app.
export default async function Page() {
  const signedIn = (await cookies()).has("auth_token");
  return signedIn ? <CustomerHome /> : <Landing />;
}
