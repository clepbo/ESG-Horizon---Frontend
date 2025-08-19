"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";

type FormFields = {
    email: string;
    password: string;
};

export default function LoginForm() {
    const { login } = useAuth();

    const [loading, setLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormFields>({
        defaultValues: { email: "", password: "" },
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setLoading(true);
        setIsTransitioning(true);

        try {
            await login(data.email, data.password);
            setTimeout(() => {
                toast.success("Welcome back!");
            }, 1000);
        } catch (error) {
            setIsTransitioning(false);
            setLoading(false);
            const axiosError = error as AxiosError;
            const data = axiosError?.response?.data as
                | { message: string; error?: string; statusCode?: number }
                | undefined;

            const errorMessage = data?.message ?? "Login failed";
            toast.error(errorMessage);
            setError("root", {
                message: errorMessage || "Invalid credentials",
            });
            setIsTransitioning(false);
            setLoading(false);
            return;
        }

    };

    return (
        <div className="relative">
            {/* Transition Overlay */}
            {isTransitioning && (
                <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 z-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" />
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100" />
                                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                        <p className="text-lg text-gray-600 font-medium animate-pulse">
                            Logging you in...
                        </p>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
            >
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
                        <p className="text-sm text-red-500 mt-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password Field */}
                <div className="relative">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-neutral-1000"
                    >
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
                                    message:
                                        "Password must be at least 4 characters",
                                },
                            })}
                            className={`mt-1 w-full rounded border px-4 py-2 pr-10 text-sm text-black outline-none transition-colors ${
                                errors.password
                                    ? "border-red-500"
                                    : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
                            }`}
                            disabled={loading || isTransitioning}
                        />

                        {/* Toggle Eye Button */}
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Forgot Password */}
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
                            : "bg-green-500 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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
                        <p className="text-sm text-red-700 text-center">
                            {errors.root.message}
                        </p>
                    </div>
                )}
            </form>

            {/* Signup Link */}
            <div className="mt-6 text-center text-sm text-neutral-600">
                <p>
                    Don’t have an account?{" "}
                    <Link
                        href="/esg/auth/signup"
                        className="text-neutral-900 font-medium hover:underline"
                    >
                        Sign up here
                    </Link>
                </p>
            </div>
        </div>
    );
}
