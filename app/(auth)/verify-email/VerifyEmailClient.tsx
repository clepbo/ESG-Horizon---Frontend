"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import BackButton from "@/app/components/ui/reusables/BackButton";
import { authService } from "@/services/auth.service";
import { handleAxiosError } from "@/lib/utils";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState<string[]>(Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState<number>(60);
  const [resendingCode, setResendingCode] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 3) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join("");

    if (otp.length !== 4) {
      toast.error("Please enter the 4-digit code.");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp({ email: email, otp: otp });
      toast.success("Email verified!");
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
      );
    } catch (error) {
      const errorMessage = handleAxiosError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      setResendingCode(true);
      // await authService.resendToken({ email });
      await authService.forgotPassword({
        email,
      });
      toast.success("Verification code resent!");
      setCountdown(60);
    } catch (error) {
      const errorMessage = handleAxiosError(error);
      toast.error(errorMessage);
    } finally {
      setResendingCode(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-white">
      <Image
        src="/login-flow-background-image.png"
        alt="Login background"
        fill
        sizes="(min-width: 1024px) 45vw, 100vw"
        className="absolute inset-0 z-0 object-cover"
        priority
      />
      <div className="w-full max-w-md space-y-6 z-10">
        <BackButton />

        <div className="bg-white rounded-lg border border-neutral-200 p-8 shadow-sm relative z-10">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Email Verification</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Enter the 4-digit code sent to <span className="font-semibold break-all">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 items-center justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => {
                    if (el) inputsRef.current[index] = el;
                  }}
                  className="w-12 h-12 border border-neutral-300 rounded text-center text-lg outline-none text-black focus:ring-1 focus:ring-esg-green focus:border-esg-green"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 text-sm font-semibold rounded-md text-white transition cursor-pointer ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="text-sm text-neutral-600 mt-4 space-y-1 text-center">
            <p>
              Didn’t receive code?{" "}
              {countdown > 0 ? (
                <span className="text-neutral-500">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  className="text-neutral-900 font-medium hover:underline"
                  disabled={resendingCode}
                >
                  {resendingCode ? "Resending..." : "Resend code"}
                </button>
              )}
            </p>
            <p>
              Not your email?{" "}
              <Link
                href="/forgot-password"
                className="text-neutral-900 font-medium hover:underline"
              >
                Change Email
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
