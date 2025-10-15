"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-toastify";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FormField } from "@/app/components/ui/reusables/FormFields";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import Select from "react-select";
import { industriesService } from "@/services/industries.services";
import { AxiosError } from "axios";
import { FaApple } from "react-icons/fa";

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);

const MicrosoftIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M11 2h-9v9h9v-9z" fill="#F25022" />
        <path d="M22 2h-9v9h9v-9z" fill="#00A4EF" />
        <path d="M11 13h-9v9h9v-9z" fill="#FFB900" />
        <path d="M22 13h-9v9h9v-9z" fill="#7FBA00" />
    </svg>
);

const singleStepSignupSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    companyName: z.string().min(2, "Company name is required"),
    industryId: z.string().min(1, "Please select your industry"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SingleStepSignupData = z.infer<typeof singleStepSignupSchema>;

export const SignupForm = ({ onSubmitted }: { onSubmitted: () => void }) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SingleStepSignupData>({
        resolver: zodResolver(singleStepSignupSchema),
    });
    const { signup, socialLogin } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [industryOptions, setIndustryOptions] = useState<
        { value: string; label: string }[]
    >([]);

    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const data = await industriesService.getIndustries();
                setIndustryOptions(
                    data.map((i) => ({
                        value: i.id.toString(),
                        label: `${i.industry} (${i.sector})`,
                    }))
                );
            } catch (error) {
                console.error("Failed to load industries:", error);
            }
        };
        fetchIndustries();
    }, []);

    const onSubmit = async (data: SingleStepSignupData) => {
        setLoading(true);

        try {
            const payload = {
                name: data.companyName,
                industryId: Number(data.industryId),
                full_name: data.fullName,
                email: data.email,
                password: data.password,
            };

            await signup(payload);
            toast.success("Account created successfully!");
            onSubmitted();
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error(axiosError);
            const errorMessage =
                axiosError?.response?.data?.message || "Signup failed";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg space-y-6">
            <h2 className="text-2xl font-bold text-neutral-1000">
                Let&apos;s get started
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Full Name"
                        required
                        {...register("fullName")}
                        error={errors.fullName}
                        placeholder="Enter your full name"
                    />

                    <FormField
                        label="Email Address"
                        required
                        type="email"
                        {...register("email")}
                        error={errors.email}
                        placeholder="email.example@company.com"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Company Name"
                        required
                        {...register("companyName")}
                        error={errors.companyName}
                        placeholder="Enter your company name"
                    />

                    <Controller
                        name="industryId"
                        control={control}
                        render={({ field }) => {
                            const selectedOption =
                                industryOptions.find(
                                    (opt) => opt.value === field.value
                                ) || null;
                            return (
                                <div className="flex flex-col">
                                    <label className="block text-sm font-medium text-neutral-1000">
                                        Industry
                                    </label>
                                    <Select
                                        placeholder="Select an industry"
                                        options={industryOptions}
                                        value={selectedOption}
                                        onChange={(option) =>
                                            field.onChange(option?.value ?? "")
                                        }
                                        isClearable
                                        styles={{
                                            control: (provided, state) => ({
                                                ...provided,
                                                marginTop: "0.2rem",
                                                minHeight: "2.4rem",
                                                height: "2.4rem",
                                                padding: "0 0.5rem",
                                                borderColor: errors.industryId
                                                    ? "#ef4444"
                                                    : state.isFocused
                                                    ? "#9ca3af"
                                                    : "#9ca3af",
                                                boxShadow: "none",
                                                "&:hover": {
                                                    cursor: "pointer",
                                                },
                                            }),
                                            input: (provided) => ({
                                                ...provided,
                                                padding: "0",
                                            }),
                                            valueContainer: (provided) => ({
                                                ...provided,
                                                padding: "0",
                                            }),
                                            singleValue: (provided) => ({
                                                ...provided,
                                                margin: "0",
                                            }),
                                            placeholder: (provided) => ({
                                                ...provided,
                                                margin: "0",
                                            }),
                                            indicatorsContainer: (
                                                provided
                                            ) => ({
                                                ...provided,
                                                height: "100%",
                                                alignItems: "center",
                                            }),
                                            dropdownIndicator: (provided) => ({
                                                ...provided,
                                                padding: "0 8px",
                                            }),
                                            clearIndicator: (provided) => ({
                                                ...provided,
                                                padding: "0 8px",
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999,
                                            }),
                                        }}
                                    />
                                    {errors.industryId && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.industryId.message}
                                        </p>
                                    )}
                                </div>
                            );
                        }}
                    />
                </div>

                <div className="relative w-full">
                    <FormField
                        label="Create Password"
                        required
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        error={errors.password}
                        placeholder="Enter a strong password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                </div>

                <Button
                    type="submit"
                    className="w-full hover:cursor-pointer bg-primary hover:bg-primary/90 text-white py-3 rounded-md font-medium"
                    disabled={isSubmitting || loading}
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </Button>
            </form>

            <div className="mt-4 space-y-4 text-center">
                {/* Separator line */}
                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-300" />
                    <span className="mx-4 flex-shrink text-sm text-neutral-600">
                        or continue with
                    </span>
                    <div className="flex-grow border-t border-gray-300" />
                </div>
                {/* Social buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => socialLogin("google")}
                        className="hover:cursor-pointer flex flex-1 items-center justify-center space-x-2 rounded border border-gray-300 bg-white py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        disabled={loading || isSubmitting}
                    >
                        <GoogleIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Google</span>
                    </button>
                    <button
                        className="cursor-not-allowed flex flex-1 items-center justify-center space-x-2 rounded border border-gray-300 bg-white py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        disabled={loading || isSubmitting}
                    >
                        <FaApple className="h-5 w-5 text-black" />
                        <span className="hidden sm:inline">Apple</span>
                    </button>
                    <button
                        className="cursor-not-allowed flex flex-1 items-center justify-center space-x-2 rounded border border-gray-300 bg-white py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        disabled={loading || isSubmitting}
                    >
                        <MicrosoftIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Microsoft</span>
                    </button>
                </div>

                <p className="mt-2 text-center text-sm text-neutral-600">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-neutral-900 hover:underline"
                    >
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};
