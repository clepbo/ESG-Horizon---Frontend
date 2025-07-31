"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation"; // ← Import router
import Link from "next/link";

type FormFields = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // ← Initialize router

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000)); // mock login
      console.log(data);
      toast.success("Login successful!");
      reset();

      // ✅ Redirect after success
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setError("root", { message: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-1000"
        >
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
          className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none ${
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

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-neutral-1000"
        >
          Password <span className="text-neutral-1000">*</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
          className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none ${
            errors.password
              ? "border-red-500"
              : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
          }`}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Forgot password */}
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-neutral-1000 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        disabled={loading}
        className={`w-full py-2 px-4 rounded text-sm font-semibold transition cursor-pointer ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600 text-neutral-50"
        } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? "Loading..." : "Login"}
      </button>

      {/* Root Error */}
      {errors.root && (
        <p className="text-sm text-red-500 text-center" role="alert">
          {errors.root.message}
        </p>
      )}
    </form>
  );
}
