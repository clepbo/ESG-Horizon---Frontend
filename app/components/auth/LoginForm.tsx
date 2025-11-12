"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const MicrosoftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 2h-9v9h9v-9z" fill="#F25022" />
    <path d="M22 2h-9v9h9v-9z" fill="#00A4EF" />
    <path d="M11 13h-9v9h9v-9z" fill="#FFB900" />
    <path d="M22 13h-9v9h9v-9z" fill="#7FBA00" />
  </svg>
);

type FormFields = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { login, socialLogin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingSocialLogin, setLoadingSocialLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: { email: "", password: "" },
  });

  const awaitingApprovalMessage =
    "To ensure platform security, your account is pending a final review by an ESG Horizon administrator. This is typically completed within one business day. You will be notified via your corporate email as soon as it's approved.";

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setLoading(true);
    setIsTransitioning(true);

    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
    } catch (error) {
      const message = (error as Error).message || "Login failed";
      if (message && message.includes("awaiting approval")) {
        toast.info(awaitingApprovalMessage, { autoClose: 15000 });
      } else {
        toast.error(message);
      }
      setError("root", { message });
      setTimeout(() => {
        clearErrors("root");
      }, 3000);
      setLoading(false);
      setIsTransitioning(false);
    }
  };

  const onSocialLoginClick = async (provider: "google") => {
    setLoadingSocialLogin(true);
    setLoading(true);
    try {
      await socialLogin(provider);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Login failed. Please try again.";

      if (message.includes("awaiting approval")) {
        toast.info(
          "To ensure platform security, your account is pending a final review by an ESG Horizon administrator. This is typically completed within one business day. You will be notified via your corporate email as soon as it's approved.",
          { autoClose: 15000 }
        );
      } else {
        toast.error(message);
      }

      setLoadingSocialLogin(false);
      setLoading(false);
    }
  };

  return (
    <div className="relative mt-36">
      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="p-10 inset-0 z-50 flex items-center justify-start">
          <div className="text-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-[color:var(--color-primary)] rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-[color:var(--color-secondary)] rounded-full animate-bounce delay-100" />
                <div className="w-3 h-3 bg-[color:var(--color-tertiary)] rounded-full animate-bounce delay-200" />
              </div>
            </div>
            <p className="text-lg text-gray-600 font-medium animate-pulse">Logging you in...</p>
          </div>
        </div>
      )}

      {!isTransitioning && (
        <section>
          <h2 className="text-left text-xl md:text-2xl font-semibold text-dark-500 mb-4">
            Login to your account
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-1000">
                Email <span className="text-neutral-1000">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "Invalid email format",
                  },
                })}
                className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none transition-colors ${
                  errors.email
                    ? "border-red-500"
                    : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
                }`}
                disabled={loading || isTransitioning}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-1000">
                Password <span className="text-neutral-1000">*</span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 4,
                      message: "Password must be at least 4 characters",
                    },
                  })}
                  className={`mt-1 w-full rounded border px-4 py-2 pr-10 text-sm text-black outline-none transition-colors ${
                    errors.password
                      ? "border-red-500"
                      : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
                  }`}
                  disabled={loading || isTransitioning}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-neutral-1000 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || isTransitioning}
              className={`w-full py-3 px-4 rounded text-sm font-semibold transition-all duration-300 cursor-pointer ${
                loading || isTransitioning
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[var(--color-primary)] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : isTransitioning ? (
                "Redirecting..."
              ) : (
                "Login"
              )}
            </button>

            {/* Root Error */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 text-center">{errors.root.message}</p>
              </div>
            )}
          </form>

          <div className="mt-4 space-y-4 text-center">
            {/* Separator line */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-4 flex-shrink text-sm text-neutral-600">or continue with</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>
            {/* Social buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onSocialLoginClick("google")}
                className="hover:cursor-pointer flex flex-1 items-center justify-center space-x-2 rounded border border-gray-300 bg-white py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                disabled={loadingSocialLogin}
              >
                {loadingSocialLogin ? (
                  <span>Please wait</span>
                ) : (
                  <>
                    <GoogleIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Google</span>
                  </>
                )}
              </button>
              <button
                className="cursor-not-allowed flex flex-1 items-center justify-center space-x-2 rounded border border-gray-300 bg-white py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                disabled={loading || isTransitioning}
              >
                <FaApple className="h-5 w-5 text-black" />
                <span className="hidden sm:inline">Apple</span>
              </button>
              <button
                className="cursor-not-allowed flex flex-1 items-center justify-center space-x-2 rounded border border-gray-300 bg-white py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                disabled={loading || isTransitioning}
              >
                <MicrosoftIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Microsoft</span>
              </button>
            </div>

            <p className="mt-2 text-center text-sm text-neutral-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-neutral-900 hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
