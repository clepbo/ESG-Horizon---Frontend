"use client";

import LoginForm from "@/app/components/auth/LoginForm";
import Image from "next/image";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  return (
    <>
      <ToastContainer />

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left image */}
        <div className="hidden lg:block md:w-1/2">
          <Image
            src="/login-image.png"
            alt="Login background"
            width={800}
            height={600}
            className="h-screen w-full object-cover"
          />
        </div>

        {/* Right section */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12 bg-white poppins">
          <div className="w-full max-w-md space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <Image
                src="/logo.svg"
                alt="ESG Horizon"
                width={329}
                height={134}
              />
            </div>

            <div className="rounded-xl border border-gray-200 shadow-lg bg-white p-8">
              <div className="space-y-6">
                <h2 className="text-center text-2xl md:text-3xl font-semibold text-neutral-1000">
                  Login to your account
                </h2>

                {/* Login Form */}
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
