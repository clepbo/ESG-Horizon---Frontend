"use client";

import Image from "next/image";
import { SignupForm } from "@/app/components/auth/SignupForm";
import "react-toastify/dist/ReactToastify.css";
import { SecuritySlider } from "@/app/components/ui/reusables/SecuritySlider";
import { motion } from "framer-motion";
import { useState } from "react";
import { RequestSubmitted } from "@/app/components/auth/RequestSubmitted";

export default function Index() {
  const [currentStep, setCurrentStep] = useState<"signup" | "submitted">(
    "signup"
  );

  if (currentStep === "submitted") {
    return (
      <>
        <RequestSubmitted />
      </>
    );
  }

  const handleSubmitted = () => setCurrentStep("submitted");

  return (
    <>
      <div className="flex flex-col lg:flex-row font-poppins h-screen overflow-hidden">
        {/* Left */}
        <div className="relative hidden lg:flex w-full lg:w-[45%] px-12 py-6 h-screen overflow-hidden">
          <Image
            src="/login-image.png"
            alt="Login background"
            fill
            className="absolute inset-0 object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[var(--color-primary)] opacity-60 z-10" />
          <div className="absolute inset-0 bg-black opacity-50 z-10" />
          <div className="relative z-20 flex flex-col justify-center items-start px-10">
            {/* <Image
                            src="/logo-new.png"
                            alt="ESG Horizon Logo"
                            width={120}
                            height={60}
                            priority
                            className="mb-6 hidden md:block"
                        /> */}
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
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            duration: 0.5,
          }}
          className="flex flex-1 items-center justify-center px-6 py-12 md:px-12 bg-white overflow-y-auto h-full"
        >
          <div className="flex flex-1 flex-col px-2 md:px-4 bg-white overflow-y-auto">
            <div className="flex px-6 ">
              <Image
                src="/Logo.svg"
                alt="ESG Horizon Logo"
                width={50}
                height={50}
                className="h-40 w-auto object-contain"
                priority
              />
            </div>

            <div className="flex flex-1 items-center justify-center px-6  md:px-12 bg-white">
              <div className="w-full max-w-lg space-y-6">
                <SignupForm onSubmitted={handleSubmitted} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
