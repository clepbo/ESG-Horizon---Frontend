"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type FormFields = {
  email: string;
  password: string;
};

const validUsers = [
  { email: "esg@horizon.com", password: "password", role: "ESG Manager" },
];

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
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
      await new Promise((res) => setTimeout(res, 800));

      const user = validUsers.find(
        (u) => u.email === data.email && u.password === data.password
      );

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Optionally store user in localStorage or global state
      localStorage.setItem("currentUser", JSON.stringify(user));

      router.push("/esg-verify-email");
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid credentials") {
        setError("root", {
          message:
            "Invalid email or password. Try esg@horizon.com with password 'password'",
        });
      } else {
        setError("root", {
          message: "Something went wrong. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Login to your account
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="email@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                message: "Invalid email format",
              },
            })}
            className={`w-full border rounded-md px-4 py-3 text-sm outline-none ${
              errors.email
                ? "border-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-esg-green"
            }`}
            disabled={loading}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 4,
                message: "Password must be at least 4 characters",
              },
            })}
            className={`w-full border rounded-md px-4 py-3 text-sm outline-none ${
              errors.password
                ? "border-red-500"
                : "border-gray-300 focus:ring-2 focus:ring-esg-green"
            }`}
            disabled={loading}
          />
          <div className="text-right mt-2">
            <Link
              href="/esg-forgot-password"
              className="text-sm text-gray-500 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md font-medium text-white transition-all cursor-pointer ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* Root error */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3 text-sm text-red-700 text-center">
            {errors.root.message}
          </div>
        )}
      </form>

      <p className="text-center text-sm text-gray-700 mt-6">
        Don’t have an account?{" "}
        <Link
          href="/esg-sign-up"
          className="font-medium text-esg-green hover:underline"
        >
          Sign up here
        </Link>
      </p>
    </div>
  );
}
