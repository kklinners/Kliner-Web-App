"use client";
import KlinerLoader from "../../../components/KlinerLoader";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from "../../../../services/authService";
import AuthLogo from "../../AuthLogo";
export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(300);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const images = ["/hero-slid.png", "/hero-slide.png", "/hero-slidee.png"];

  useEffect(() => {
    // Get email from localStorage if available
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("verification_email");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      if (value && index < 3) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email not found. Please go back to registration page.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const response = await AuthService.resendVerificationCode(email);

      if (response.success) {
        setTimer(300); // Reset timer to 5 minutes
      } else {
        setError(
          response.error ||
            response.message ||
            "Failed to resend verification code"
        );
      }
    } catch (error) {
      console.error("Error resending code:", error);
      setError(error.message || "An error occurred while resending the code");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email not found. Please go back to registration page.");
      return;
    }

    // Combine the verification code digits
    const otp = verificationCode.join("");

    // Validate OTP format
    if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      setError("Please enter a valid 4-digit verification code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await AuthService.verifyEmail(email, otp);

      if (response.success) {
        setIsModalOpen(true);
      } else {
        setError(
          response.error ||
            response.message ||
            "Verification failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(error.message || "An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  // Function to close modal and navigate to login page
  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push("/auth/signin");
  };

  return (
    <div className="flex h-screen w-screen">
      <div
        className="hidden lg:flex w-1/2 h-screen bg-cover bg-center items-end justify-center relative transition-all duration-1000"
        style={{ backgroundImage: `url('${images[currentSlide]}')` }}
      >
        <div className="absolute inset-0 bg-brand-950/60"></div>
      </div>

      <div className="relative flex-1 flex items-center justify-center bg-[#EFEDE8] py-6">
        <div className="w-full max-w-md my-auto p-6">
          <AuthLogo />
          <h1 className="text-2xl mb-4 text-center text-brand-950 font-semibold tracking-[-0.02em] leading-tight">
            Verify Your Email
          </h1>

          {email && (
            <p className="text-base text-center mb-2 text-brand-950">
              Please enter the 4-digit code sent to{" "}
              <span className="font-medium">{email}</span>
            </p>
          )}

          <p className="text-sm text-center mb-6 text-brand-900/70">
            Code expires in{" "}
            <span className="font-medium text-brand-600">
              {formatTime(timer)}
            </span>
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="flex justify-center space-x-2 mb-6">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-brand-950 text-xl border-2 rounded-lg focus:border-brand-600 focus:ring-brand-500 outline-none"
                  disabled={isVerifying}
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-3/4 bg-brand-600 border border-[brand-600] text-lg text-white py-2 rounded-lg mx-auto block mb-4 flex items-center justify-center"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <KlinerLoader size={24} className="mr-2.5" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={handleResendCode}
              disabled={timer > 0 || isResending}
              className={`text-sm font-medium ${
                timer > 0 || isResending
                  ? "text-brand-900/50 cursor-not-allowed"
                  : "text-brand-600 hover:text-brand-600/80"
              }`}
            >
              {isResending
                ? "Sending..."
                : timer > 0
                ? `Resend code in ${formatTime(timer)}`
                : "Resend verification code"}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-950/60 flex items-center justify-center z-50">
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
            <h3 className="text-xl mb-2 text-brand-600 font-semibold tracking-[-0.02em] leading-tight">Success!</h3>
            <p className="mb-4 text-brand-900/70">
              Your email has been verified successfully!
            </p>
            <button
              onClick={handleCloseModal}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-600/90 transition"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
