"use client";

import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-toastify";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FormField } from "@/app/components/ui/reusables/FormFields";
import { esgService } from "@/services/esg.service";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import type { CountryCode } from "libphonenumber-js";
import "react-phone-number-input/style.css";
import { parsePhoneNumberWithError } from "libphonenumber-js";

const signupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    workEmail: z.string().email("Please enter a valid email address"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .refine(
        (val) => {
          try {
            const phone = parsePhoneNumberWithError(val);
            return phone.isValid();
          } catch {
            return false;
          }
        },
        {
          message: "Please enter a valid phone number for the selected country",
        }
      ),
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [country, setCountry] = useState<CountryCode | undefined>(undefined);

  // --- Auto-detect country from browser ---
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data?.country_code) {
          setCountry(data.country_code as CountryCode);
        } else {
          setCountry("US");
        }
      })
      .catch(() => setCountry("US")); // fallback
  }, []);

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const check = await esgService.checkMail(data.workEmail);
      const { exists } = check;
      if (exists) {
        setError("workEmail", {
          type: "manual",
          message: "This email is already registered",
        });
        setLoading(false);
        return;
      }
      onNext(data);
    } catch (error) {
      setLoading(false);
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
          <div className="relative">
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
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <FormField
              label="Confirm Password"
              required
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number <span className="">*</span>
            </label>
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  defaultCountry={country}
                  international
                  withCountryCallingCode
                  className={`w-full rounded-lg border  px-3 py-2 text-base  [&>input]:outline-none ${
                    errors.phoneNumber
                      ? "border-red-500 "
                      : "border-neutral-500 focus:outline-none focus:ring-primary"
                  }`}
                  //   className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-base focus:outline-none focus:ring-primary  [&>input]:outline-none"
                />
              )}
            />

            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600 border-red-500 ">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
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
          className="w-full hover:cursor-pointer bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
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
