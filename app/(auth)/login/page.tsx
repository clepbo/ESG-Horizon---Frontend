"use client";

import LoginForm from "@/app/components/auth/LoginForm";

import Image from "next/image";

import "react-toastify/dist/ReactToastify.css";
import { SecuritySlider } from "../../components/ui/reusables/SecuritySlider";

export default function LoginPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row font-poppins">
        <div className="relative hidden lg:flex w-full lg:w-[45%] px-12 py-6 min-h-screen ">
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
            <div className="mt-16 text-white">
              <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-base leading-relaxed text-white/90">
                Access your dashboard, manage ESG data, and collaborate with
                your team — securely and efficiently.
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
                width={50}
                height={50}
                className="h-20 w-auto object-contain"
              />
            </div>

            <div className="bg-white p-8 space-y-6">
              <h2 className="text-center text-2xl md:text-3xl font-semibold text-neutral-900">
                Login to your account
              </h2>

              {/* Login Form */}
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
