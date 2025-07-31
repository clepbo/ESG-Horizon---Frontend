"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FormFields = {
  email: string;
  password: string;
};

const validUsers = [
  { email: "admin@horizon.com", password: "password", role: "Admin" },
  { email: "esg@horizon.com", password: "password", role: "ESG Manager" },
];

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const router = useRouter(); 
=======
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
>>>>>>> 34c70623f451d34e3a421b4e59d15d67b12178bc

  const {
    register,
    handleSubmit,
    // reset,
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
<<<<<<< HEAD
      await new Promise((res) => setTimeout(res, 1000)); // mock login
      console.log(data);
      toast.success("Login successful!");
      reset();

      // ✅ Redirect after success
      router.push("/dashboard");
=======
      // Simulate API delay
      await new Promise((res) => setTimeout(res, 800));
      
      // Check if user exists and credentials match
      const user = validUsers.find(
        (u) => u.email === data.email && u.password === data.password
      );

      if (!user) {
        throw new Error("Invalid credentials");
      }

      console.log("Login successful for:", user);
      
      // Show success message
      toast.success(`Welcome back, ${user.role}!`);
      
      // Start transition
      setIsTransitioning(true);
      
      // Store user info (you can use localStorage, context, or your preferred state management)
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      // Smooth transition delay before redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500); // 1.5 seconds for smooth transition

>>>>>>> 34c70623f451d34e3a421b4e59d15d67b12178bc
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message === "Invalid credentials") {
        toast.error("Invalid email or password. Please try again.");
        setError("root", { 
          message: "Invalid email or password. Use admin@horizon.com or esg@horizon.com with password 'password'" 
        });
      } else {
        toast.error("Something went wrong. Please try again.");
        setError("root", { message: "An unexpected error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <div className="relative">
      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
            <p className="text-lg text-gray-600 font-medium animate-pulse">
              Logging you in...
            </p>
          </div>
        </div>
>>>>>>> 34c70623f451d34e3a421b4e59d15d67b12178bc
      )}

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
            className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none transition-colors ${
              errors.email
                ? "border-red-500"
                : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
            }`}
            disabled={loading || isTransitioning}
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
                value: 4,
                message: "Password must be at least 4 characters",
              },
            })}
            className={`mt-1 w-full rounded border px-4 py-2 text-sm text-black outline-none transition-colors ${
              errors.password
                ? "border-red-500"
                : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
            }`}
            disabled={loading || isTransitioning}
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
          type="submit"
          disabled={loading || isTransitioning}
          className={`w-full py-3 px-4 rounded text-sm font-semibold transition-all duration-300 cursor-pointer ${
            loading || isTransitioning
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          } focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            <p className="text-sm text-red-700 text-center" role="alert">
              {errors.root.message}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
