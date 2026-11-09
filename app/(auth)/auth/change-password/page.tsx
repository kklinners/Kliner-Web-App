"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import AuthService from "../../../../services/authService";
import AuthLogo from "../../AuthLogo";

export default function CreateNewPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = ["/hero-slid.png", "/hero-slide.png", "/hero-slidee.png"];

  useEffect(() => {
    // Get email from localStorage if available
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("verification_email");
      if (storedEmail) {
        setFormData((prev) => ({ ...prev, email: storedEmail }));
      }
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!formData.email) {
      setError("Email is required. Try going back to the previous step.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await AuthService.changePassword(
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      if (response.success) {
        setIsModalOpen(true);
      } else {
        setError(
          response.error ||
            response.message ||
            "Failed to update password. Please try again."
        );
      }
    } catch (error) {
      console.error("Password update error:", error);
      setError(
        error.message || "An error occurred while updating your password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push("/auth/sigin");
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left Side with Sliding Images */}
      <div
        className="hidden lg:flex w-1/2 h-screen bg-cover bg-center items-end justify-center relative transition-all duration-1000"
        style={{ backgroundImage: `url('${images[currentSlide]}')` }}
      >
        <div className="absolute inset-0 bg-brand-950/60"></div>
        <div className="relative text-center text-white pb-10 px-6 w-full">
          <h2 className="text-xl lg:text-2xl mb-3 font-semibold tracking-[-0.02em] leading-tight">
            Impeccable Service
          </h2>
          <p className="text-sm lg:text-base opacity-80 mb-4">
            Klinners.co helps you tidy up your environment impeccably
          </p>
          <div className="flex justify-center space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-white" : "bg-white/40"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side with Form */}
      <div className="relative flex-1 flex items-center justify-center bg-[#EFEDE8] pt-[92px] lg:pt-[140px] pb-6">
        <AuthLogo />
        <div className="w-full max-w-md p-6">

          <h1 className="text-2xl mb-4 text-center text-brand-950 font-semibold tracking-[-0.02em] leading-tight">
            Create New Password
          </h1>
          <p className="text-base text-center mb-6 text-brand-900/70">
            Your new password must be different from previously used passwords
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border text-brand-950 rounded-lg focus:border-brand-600 focus:ring-brand-600 outline-none"
                placeholder="New Password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                disabled={isSubmitting}
              >
                {showPassword.new ? (
                  <EyeOff className="text-brand-900/70 w-5 h-5" />
                ) : (
                  <Eye className="text-brand-900/70 w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border text-brand-950 rounded-lg focus:border-brand-600 focus:ring-brand-600 outline-none"
                placeholder="Confirm Password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                disabled={isSubmitting}
              >
                {showPassword.confirm ? (
                  <EyeOff className="text-brand-900/70 w-5 h-5" />
                ) : (
                  <Eye className="text-brand-900/70 w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 text-white text-lg py-3 rounded-lg transition-colors hover:bg-brand-600/90 disabled:bg-brand-600/50 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <p className="text-sm text-brand-900/70 mt-4 text-center">
            Password must be at least 8 characters long
          </p>
        </div>
      </div>

      {/* Enhanced Success Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-brand-950/60 z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full mx-4 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl text-brand-950 mb-2 font-semibold tracking-[-0.02em] leading-tight">
                Password Updated!
              </h2>
              <p className="text-brand-900/70 mb-6">
                Your password has been successfully updated. You can now sign in
                with your new password.
              </p>
              <button
                onClick={handleModalClose}
                className="w-full bg-brand-600 text-white py-3 rounded-lg hover:bg-brand-600/90 transition-colors"
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
