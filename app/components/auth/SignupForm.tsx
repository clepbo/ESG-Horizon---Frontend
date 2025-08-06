"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-toastify";
import Link from "next/link";
import { useState } from "react";
import { FormField } from "@/app/components/FormFields";

const signupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    workEmail: z.string().email("Please enter a valid email address"),
    phoneNumber: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const SignupForm = ({
  onNext,
}: {
  onNext: (data: SignupFormData) => void;
}) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
      toast.success("Account created successfully! Welcome to ESG Horizon.");
      onNext(data); // ✅ Pass collected form data to parent
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed";
      toast.error(errorMessage);
      setError("root", { message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-3 h-3 rounded-full bg-primary"></div>
        <div className="flex-1 h-1 bg-gray-200 rounded-full">
          <div className="w-1/4 h-full bg-primary rounded-full"></div>
        </div>
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">
        Let&apos;s get started
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="First Name"
            required
            {...register("firstName")}
            error={errors.firstName}
            placeholder="Enter your first name"
          />
          <FormField
            label="Last Name"
            required
            {...register("lastName")}
            error={errors.lastName}
            placeholder="Enter your last name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Work Email"
            required
            type="email"
            {...register("workEmail")}
            error={errors.workEmail}
            placeholder="email.example@company.com"
          />
          <FormField
            label="Phone Number"
            required
            {...register("phoneNumber")}
            error={errors.phoneNumber}
            placeholder="0812345678"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Create Password"
            required
            type="password"
            {...register("password")}
            error={errors.password}
            placeholder="Enter a strong password"
          />
          <FormField
            label="Confirm Password"
            required
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
          disabled={isSubmitting || loading}
        >
          {loading ? "Creating Account..." : "Continue"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-neutral-900 font-medium hover:underline"
        >
          Login here
        </Link>
      </div>
    </div>
  );
};
