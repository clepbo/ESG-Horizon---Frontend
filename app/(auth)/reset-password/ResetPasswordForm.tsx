"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import BackButton from "@/app/components/ui/reusables/BackButton";
import { authService } from "@/services/auth.service";
import { handleAxiosError } from "@/lib/utils";

type FormFields = {
    password: string;
    confirmPassword: string;
};

export default function ResetPasswordForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState({ password: false, confirm: false });

    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const otp = searchParams.get("otp");

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormFields>();

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (!email || !otp) {
            toast.error(
                "Missing email or OTP. Please start the process again."
            );
            return;
        }
        setLoading(true);
        try {
            await authService.resetPassword({
                email,
                otp,
                new_password: data.password,
            });
            toast.success("Password reset successful!");
            setTimeout(() => router.push("/login"), 1000);
            reset();
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderPasswordInput = ({
        label,
        name,
        isShown,
        toggle,
        placeholder,
        validate,
    }: {
        label: string;
        name: keyof FormFields;
        isShown: boolean;
        toggle: () => void;
        placeholder: string;
        validate?: (val: string) => string | boolean;
    }) => (
        <div>
            <label
                htmlFor={name}
                className="block text-sm font-medium text-neutral-900 mb-1"
            >
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <input
                    id={name}
                    type={isShown ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={placeholder}
                    {...register(name, {
                        required: `${label} is required`,
                        ...(name === "password"
                            ? {
                                  minLength: {
                                      value: 4,
                                      message:
                                          "Password must be at least 4 characters",
                                  },
                              }
                            : {}),
                        ...(validate ? { validate } : {}),
                    })}
                    className={`w-full border px-4 py-2 text-sm rounded-md outline-none text-black placeholder:text-neutral-400 ${
                        errors[name]
                            ? "border-red-500"
                            : "border-neutral-300 focus:border-esg-green focus:ring-1 focus:ring-esg-green"
                    }`}
                />
                <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    aria-label={isShown ? "Hide password" : "Show password"}
                >
                    {isShown ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {errors[name] && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                    {errors[name]?.message}
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative bg-white">
            {/* ✅ Background image */}
            <Image
                src="/login-flow-background-image.png"
                alt="Background"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="absolute inset-0 z-0 object-cover"
                priority
            />

            <div className="w-full max-w-md space-y-6 z-10">
                {/* ✅ Reusable Back Button */}
                <BackButton />

                {/* Card */}
                <div className="bg-white rounded-lg border border-neutral-200 p-8 shadow-sm space-y-6 relative z-10">
                    <header>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                            Create a secure password
                        </h2>
                        <p className="text-sm text-neutral-600">
                            Please enter a strong password and keep it safe.
                        </p>
                    </header>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                        noValidate
                    >
                        {renderPasswordInput({
                            label: "New Password",
                            name: "password",
                            isShown: show.password,
                            toggle: () =>
                                setShow((s) => ({
                                    ...s,
                                    password: !s.password,
                                })),
                            placeholder: "Enter your new password",
                        })}

                        {renderPasswordInput({
                            label: "Confirm Password",
                            name: "confirmPassword",
                            isShown: show.confirm,
                            toggle: () =>
                                setShow((s) => ({ ...s, confirm: !s.confirm })),
                            placeholder: "Confirm your new password",
                            validate: (val) =>
                                val === watch("password") ||
                                "Passwords do not match",
                        })}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 px-4 text-sm font-semibold rounded-md transition text-white cursor-pointer ${
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
