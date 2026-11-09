/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Kliner brand — built around the signup purple #3310C2 (= brand-600 / brand)
        brand: {
          DEFAULT: "#3310C2",
          50: "#F6F4FE",
          100: "#EEEAFE",
          200: "#DCD3FC",
          300: "#BFAEF9",
          400: "#9A80F3",
          500: "#6B46E6",
          600: "#3310C2",
          700: "#2A0D9F",
          800: "#210A7D",
          900: "#19085E",
          950: "#0F0438",
        },
      },
    },
  },
  plugins: [],
};
