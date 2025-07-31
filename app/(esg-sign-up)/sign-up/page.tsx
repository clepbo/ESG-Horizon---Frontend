"use client";

import { useState } from "react";
import Image from "next/image";
import { SignupForm } from "@/app/(esg-sign-up)/components/SignupForm";
import { OrganizationDetails } from "@/app/(esg-sign-up)/components/OrganizationDetails";
import { RequestSubmitted } from "@/app/(esg-sign-up)/components/RequestSubmitted";
import { SecuritySlider } from "@/app/(esg-sign-up)/components/SecuritySlider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Index() {
  const [currentStep, setCurrentStep] = useState<
    "signup" | "organization" | "submitted"
  >("signup");

  const handleNextStep = () => setCurrentStep("organization");
  const handleBackStep = () => setCurrentStep("signup");
  const handleComplete = () => setCurrentStep("submitted");

  const handleContinueToWebsite = () => {
    console.log("Redirecting to main website...");
  };

  if (currentStep === "submitted") {
    return (
      <>
        <RequestSubmitted onContinue={handleContinueToWebsite} />
        <ToastContainer theme="light" position="top-right" autoClose={3000} />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen flex font-poppins">
        {/* Left Panel (45%) */}
        <div className="lg:w-[45%] bg-green-600 text-white px-10 py-12 flex flex-col justify-between relative">
          {/* Logo */}
          <div>
            <Image
              src="/logo-new.png"
              alt="ESG Horizon Logo"
              width={120}
              height={60}
              priority
              className="object-contain hidden md:block"
              style={{ width: "auto", height: "auto" }}
            />

            <div className="mt-16">
              <h1 className="text-4xl font-bold leading-tight mb-6">
                Join the Future of Responsible Reporting
              </h1>
              <p className="text-base leading-relaxed text-white/90 max-w-md">
                Make your ESG data work for you. Track, manage, and showcase
                your environmental, social, and governance impact — all in one
                place. Start your journey toward smarter, transparent, and
                impactful sustainability today.
              </p>
            </div>
          </div>

          {/* Security Card */}
          <div className="mt-20">
            <SecuritySlider />
          </div>

          {/* Decorative Bubbles */}
          <div className="absolute top-20 right-8 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-40 right-16 w-20 h-20 bg-white/5 rounded-full"></div>
        </div>

        {/* Right Panel (55%) */}
        <div className="lg:w-[55%] bg-white flex flex-col justify-center px-6 sm:px-12 py-16">
          {/* Form Container */}
          <div className="min-h-screen flex items-center justify-center">
            {currentStep === "signup" ? (
              <SignupForm onNext={handleNextStep} />
            ) : (
              <OrganizationDetails
                onBack={handleBackStep}
                onNext={handleComplete}
              />
            )}
          </div>

          {/* Login Prompt */}
        </div>
      </div>

      <ToastContainer theme="light" position="top-right" autoClose={3000} />
    </>
  );
}
