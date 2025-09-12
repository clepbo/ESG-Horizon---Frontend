"use client";

import { useState } from "react";
import Image from "next/image";
import { SignupForm } from "@/app/components/auth/SignupForm";
import { OrganizationDetails } from "@/app/components/auth/OrganizationDetails";
import { RequestSubmitted } from "@/app/components/auth/RequestSubmitted";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SecuritySlider } from "@/app/components/ui/reusables/SecuritySlider";
import { useAuth } from "@/context/AuthContext";
import type { SignupFormData } from "@/app/components/auth/SignupForm";
import type { OrganizationFormData } from "@/app/components/auth/OrganizationDetails";
import { AxiosError } from "axios";

export default function Index() {
  const [currentStep, setCurrentStep] = useState<
    "signup" | "organization" | "submitted"
  >("signup");

  const [personalData, setPersonalData] = useState<SignupFormData | null>(null);

  const { signup } = useAuth();

  const handlePersonalNext = (data: SignupFormData) => {
    setPersonalData(data);
    setCurrentStep("organization");
  };
  // Step 2 → merge & submit
  const handleOrganizationSubmit = (orgData: OrganizationFormData) => {
    if (!personalData) {
      toast.error("Missing personal data");
      return;
    }
    const payload = {
      email: personalData.workEmail,
      password: personalData.password,
      first_name: personalData.firstName,
      last_name: personalData.lastName,
      phone_number: personalData.phoneNumber,
      name: orgData.companyName,
      registration_number: orgData.registrationNumber || "",
      industryId: Number(orgData.industry),
      isoCountryCode: orgData.isoCountryCode,
      address: orgData.address,
      contact_email: orgData.contactEmail,
      contact_phone: orgData.contactPhone,
      company_logo_url: "",
      staff_strength: "",
      website: orgData.website || "",
      role: "",
    };

    signup(payload)
      .then(() => {
        toast.success("Account created successfully!");
        setCurrentStep("submitted");
      })
      .catch((error) => {
        console.error(error);
        const axiosError = error as AxiosError;
        const data = axiosError?.response?.data as
          | { message: string; error?: string; statusCode?: number }
          | undefined;

        const errorMessage = data?.message ?? "Login failed";
        toast.error(errorMessage);
      });
  };

  if (currentStep === "submitted") {
    return (
      <>
        <RequestSubmitted />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row font-poppins">
        {/* Left */}
        <div className="relative hidden lg:flex w-full lg:w-[45%] px-12 py-6 min-h-screen">
          <Image
            src="/login-image.png"
            alt="Login background"
            fill
            className="absolute inset-0 object-cover"
            priority
          />
          <div className="absolute inset-0 bg-green-600 opacity-50 z-10" />
          <div className="absolute inset-0 bg-black opacity-50 z-10" />
          <div className="relative z-20 flex flex-col justify-start items-start px-10">
            <Image
              src="/logo-new.png"
              alt="ESG Horizon Logo"
              width={120}
              height={60}
              priority
              className="mb-6 hidden md:block"
            />
            <div className="text-white">
              <h1 className="text-4xl font-medium mb-6">
                Join the Future of Responsible Reporting
              </h1>
              <p className="text-base text-white/90 max-w-md">
                Make your ESG data work for you. Track, manage, and showcase
                your environmental, social, and governance impact — all in one
                place.
              </p>
            </div>
            <div className="mt-12">
              <SecuritySlider />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12 bg-white">
          <div className="w-full max-w-lg space-y-6">
            {currentStep === "signup" ? (
              <SignupForm
                onNext={handlePersonalNext}
                initialData={personalData}
              />
            ) : (
              <OrganizationDetails
                onBack={() => setCurrentStep("signup")}
                onNext={handleOrganizationSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
