"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormFields>();

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000)); // Mock API
      toast.success("Account created successfully!");
      reset();
      router.push("/signup/verify");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Stepper */}
      <div className="w-full flex justify-center">
        <div className="flex gap-2 items-center">
          <div className="h-3 w-3 rounded-full bg-green-600" />
          <div className="w-16 h-1 bg-neutral-300" />
          <div className="h-3 w-3 rounded-full bg-neutral-300" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-neutral-1000">
        Let’s get started
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">
            First Name *
          </label>
          <input
            id="firstName"
            placeholder="Enter your first name"
            {...register("firstName", { required: "First name is required" })}
            className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none ${
              errors.firstName
                ? "border-red-500"
                : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
            }`}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">
            Last Name *
          </label>
          <input
            id="lastName"
            placeholder="Enter your last name"
            {...register("lastName", { required: "Last name is required" })}
            className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none ${
              errors.lastName
                ? "border-red-500"
                : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
            }`}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Work Email *
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
            className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none ${
              errors.email
                ? "border-red-500"
                : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
            }`}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone Number *
          </label>
          <input
            id="phone"
            placeholder="08123456789"
            {...register("phone", { required: "Phone number is required" })}
            className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none ${
              errors.phone
                ? "border-red-500"
                : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
            }`}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Create Password *
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter a strong password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Must be at least 8 characters" },
            })}
            className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none ${
              errors.password
                ? "border-red-500"
                : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
            }`}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            {...register("confirmPassword", {
              required: "Confirm your password",
            })}
            className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none ${
              errors.confirmPassword
                ? "border-red-500"
                : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded text-sm font-semibold transition cursor-pointer ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white"
        } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50`}
      >
        {loading ? "Submitting..." : "Continue"}
      </button>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-1000 hover:underline"
        >
          Login here
        </Link>
      </p>
    </form>
  );
}
