"use client";

import Image from "next/image";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { SecuritySlider } from "@/app/(esg-sign-up)/components/SecuritySlider";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <div className="min-h-screen flex font-poppins">
        {/* Left Panel (45%) */}
        <div className="lg:w-[45%] bg-green-600 text-white px-10 py-12 flex flex-col justify-between relative">
          {/* Logo and Intro */}
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
                Welcome Back!
              </h1>
              <p className="text-base leading-relaxed text-white/90 max-w-md">
                Access your dashboard, manage ESG data, and collaborate with
                your team — securely and efficiently.
              </p>
            </div>
          </div>

          {/* Security Card */}
          <div className="mt-20">
            <SecuritySlider />
          </div>

          {/* Decorative Bubbles */}
          <div className="absolute top-20 right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute bottom-40 right-16 w-20 h-20 bg-white/5 rounded-full" />
        </div>

        {/* Right Panel (55%) */}
        <div className="lg:w-[55%] bg-white flex flex-col justify-center px-6 sm:px-12 py-16">
          <div className="min-h-screen flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
      </div>

      <ToastContainer theme="light" position="top-right" autoClose={3000} />
    </>
  );
}
