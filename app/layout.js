import { Manrope } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Kliner | Verified home cleaning in Gbagada",
  description: "Book verified local teams for cleaning, laundry, moving, repairs and gardening in Gbagada. See the price before you pay.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${manrope.className} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
};
