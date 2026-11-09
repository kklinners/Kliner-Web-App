"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from "../../../../services/authService";
import AuthLogo from "../../AuthLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState("");
  const router = useRouter();

  const images = ["/hero-slid.png", "/hero-slide.png", "/hero-slidee.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setError("");

    try {
      const response = await AuthService.forgotPassword(email);

      if (response.success) {
        // If successful, open the success modal
        setIsModalOpen(true);

        // Store email in localStorage for OTP verification page
        if (typeof window !== "undefined") {
          localStorage.setItem("verification_email", email);
        }
      } else {
        setError(
          response.error ||
            response.message ||
            "Failed to send reset link. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending reset link:", error);
      setError(
        error.message || "An error occurred while sending the reset link."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push("/auth/verify-pin");
  };

  return (
    <div className="flex h-screen w-screen">
      <div
        className="hidden lg:flex w-1/2 h-screen bg-cover bg-center items-end justify-center relative transition-all duration-1000"
        style={{ backgroundImage: `url('${images[currentSlide]}')` }}
      >
        <div className="absolute inset-0 bg-brand-950/60"></div>
      </div>

      <div className="relative flex-1 flex items-center justify-center bg-[#EFEDE8] pt-[92px] lg:pt-[140px] pb-6">
        <AuthLogo />
        <div className="w-full max-w-md p-6">

          <h1 className="text-2xl mb-4 text-center text-brand-950 font-semibold tracking-[-0.02em] leading-tight">
            Forgot Password
          </h1>
          <p className="text-base text-center mb-4 text-brand-900/70">
            Enter your email address to receive a password reset code
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSendResetLink}>
            <div className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSending}
                className="w-full px-4 py-2 border-2 text-brand-950 rounded-lg focus:border-brand-600 focus:ring-brand-500 outline-none"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 border border-brand-600 text-lg text-white py-2 rounded-lg mx-auto block mb-4 flex items-center justify-center"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link
              href="/auth/sigin"
              className="text-brand-600 text-sm hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-brand-950/60 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <div className="mb-4 text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl text-brand-950 font-semibold tracking-[-0.02em] leading-tight">
              Password Reset Code Sent!
            </h2>
            <p className="text-brand-900/70 mt-2">
              We've sent a verification code to <strong>{email}</strong>. Please
              check your email.
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-600/90 transition"
            >
              Verify Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
