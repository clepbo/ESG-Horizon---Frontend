"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type FormFields = {
  email: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setLoading(true);
    try {
      // Simulate async OTP send
      await new Promise((res) => setTimeout(res, 1000));
      toast.success("OTP sent to your email!");
      reset();
      router.push("/verify-email"); // ✅ redirect here
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-neutral-900 border border-neutral-300 rounded px-3 py-1 hover:bg-neutral-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            Forgot your password
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            Enter your email to reset your password
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-900 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="email.example@company.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "Invalid email format",
                  },
                })}
                className={`w-full border px-4 py-2 text-sm rounded-md outline-none text-black placeholder:text-neutral-400 ${
                  errors.email
                    ? "border-red-500"
                    : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 text-sm font-semibold rounded-md transition text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Sending..." : "Sent OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
