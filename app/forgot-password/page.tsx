"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useState } from "react";
import Image from "next/image";
import BackButton from "@/app/components/BackButton";

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
      await new Promise((res) => setTimeout(res, 500));
      toast.success("OTP sent to your email!", { position: "top-center" });
      reset();
      // router.push("/verify-email");
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP. Please try again.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-white overflow-hidden">
      {/* Background Image */}
      <Image
        src="/login-flow-background-image.png"
        alt="Background"
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="absolute inset-0 object-cover z-0"
        priority
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Back Button */}
        <BackButton />

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 shadow-sm backdrop-blur-md">
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
              className={`w-full py-2 px-4 text-sm font-semibold rounded-md transition text-white cursor-pointer ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
