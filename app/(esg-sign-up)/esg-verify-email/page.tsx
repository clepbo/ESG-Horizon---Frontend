"use client";

import { useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  //   const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move to next input if value is entered
      if (value && index < 5) {
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

    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      // Simulate async verification
      await new Promise((res) => setTimeout(res, 1000));
      toast.success("Email verified!");
      router.push("/dashboard"); // or home page
    } catch {
      toast.error("Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = () => {
    toast.success("Verification code resent!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-green-500">
      <div className="w-full max-w-md space-y-6">
        {/* Back */}
        <Link
          href="/esg-forgot-password"
          className="inline-flex items-center gap-2 text-sm text-neutral-900 border border-neutral-300 rounded px-3 py-1 hover:bg-neutral-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            Email Verification
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium">ex********@email.com</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Fields */}
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  //   ref={(el) => (inputsRef.current[index] = el)}

                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  className="w-12 h-12 border border-neutral-300 rounded text-center text-lg outline-none text-black focus:ring-1 focus:ring-esg-green focus:border-esg-green"
                />
              ))}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 text-sm font-semibold rounded-md text-white transition cursor-pointer ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          {/* Bottom links */}
          <div className="text-sm text-neutral-600 mt-4 space-y-1 text-center">
            <p>
              Didn’t receive code?{" "}
              <button
                type="button"
                onClick={resendCode}
                className="text-neutral-900 font-medium hover:underline"
              >
                Resend code
              </button>
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
