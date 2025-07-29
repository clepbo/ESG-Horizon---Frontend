"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type FormFields = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormFields>();

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      toast.success("Password reset successful!");
      reset();
      router.push("/login"); // ✅ redirect here
    } catch (error) {
      toast.error("Something went wrong.");
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

        {/* Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">
              Create a secure password
            </h2>
            <p className="text-sm text-neutral-600">
              Please enter strong password and keep it well
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Password */}
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-neutral-900 mb-1"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword" // ✅ Add this
              autoComplete="new-password"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your new password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) =>
                  val === watch("password") || "Passwords do not match",
              })}
              className={`w-full border px-4 py-2 text-sm rounded-md outline-none text-black placeholder:text-neutral-400 ${
                errors.confirmPassword
                  ? "border-red-500"
                  : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
              }`}
            />

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  autoFocus
                  autoComplete="new-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) =>
                      val === watch("password") || "Passwords do not match",
                  })}
                  className={`w-full border px-4 py-2 text-sm rounded-md outline-none text-black placeholder:text-neutral-400 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 text-sm font-semibold rounded-md transition text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
