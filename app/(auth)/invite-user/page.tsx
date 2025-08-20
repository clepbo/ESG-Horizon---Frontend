"use client";

import InviteUserForm from "@/app/components/auth/InviteUserForm";
import { Suspense } from "react";
import Image from "next/image";

import "react-toastify/dist/ReactToastify.css";
import { SecuritySlider } from "../../components/ui/reusables/SecuritySlider";
import Spinner from "../../components/ui/reusables/Spinner";

export default function InviteUserPage() {
  return (
    <>
      

      <div className="min-h-screen flex flex-col lg:flex-row font-poppins">
        {/* Left side with background image + green overlay + slider */}
        <div className="relative hidden lg:flex w-full lg:w-[45%] px-12 py-6 min-h-screen ">
          {/* Background Image */}
          <Image
            src="/login-image.png"
            alt="Login background"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="absolute inset-0 z-0 object-cover"
            priority
          />

          {/* Green Overlay */}
          <div className="absolute inset-0 bg-green-500 opacity-50 z-10" />
          <div className="absolute inset-0 bg-black opacity-50 z-10" />

          {/* Content on overlay */}
          <div className="relative z-20 flex flex-col justify-start items-start px-10 py-12 w-full">
            {/* Welcome Text */}
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

            {/* Security Slider */}
            <div className="mt-20">
              <SecuritySlider />
            </div>

            {/* Bubbles (optional decor) */}
            <div className="absolute top-20 right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute bottom-20 right-16 w-20 h-20 bg-white/10 rounded-full" />
          </div>
        </div>

        {/* Right side: Login Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12 bg-white">
          <div className="w-full max-w-md space-y-6">
            {/* Logo for small screens */}
            <div className="flex justify-center">
              <Image
                src="/logo.svg"
                alt="ESG Horizon Logo"
                width={0}
                height={0}
                className="h-20 w-auto object-contain"
              />
            </div>

            <div className="bg-white ">
              {/* inviteUser Form */}
              <Suspense fallback={<Spinner />}>
                <InviteUserForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
