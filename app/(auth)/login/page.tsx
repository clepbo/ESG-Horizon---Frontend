"use client";

import LoginForm from "@/app/components/auth/LoginForm";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";
import { SecuritySlider } from "../../components/ui/reusables/SecuritySlider";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="flex flex-col lg:flex-row font-poppins h-screen overflow-hidden">
      <div className="relative hidden lg:flex w-full lg:w-[45%] px-12 py-6 h-screen overflow-hidden">
        <Image
          src="/login-image.png"
          alt="Login background"
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="absolute inset-0 z-0 object-cover"
          priority
        />

        {/* Green Overlay */}
        <div className="absolute inset-0 bg-[var(--color-primary)] opacity-60 z-10" />
        <div className="absolute inset-0 bg-black opacity-50 z-10" />

        {/* Content on overlay */}
        <div className="relative z-20 flex flex-col justify-start items-start px-10  w-full">
          {/* Welcome Text */}
          <div className="mt-16 text-white">
            <h1 className="text-4xl font-semibold mb-4 text-left">
              Welcome To <br />
              ESG Horizon
            </h1>
            <p className="text-base leading-relaxed text-white/90">
              Access your dashboard, manage ESG data, and collaborate with your
              team — securely and efficiently.
            </p>
          </div>

          {/* Security Slider */}
          <div className="mt-20">
            <SecuritySlider />
          </div>

          <div className="absolute top-20 right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute bottom-20 right-16 w-20 h-20 bg-white/10 rounded-full" />
        </div>
      </div>

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
        <div className="flex flex-1 flex-col px-6 py-12 md:px-12 bg-white overflow-y-auto">
          <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
            <div className="fixed top-0">
              <Image
                src="/Logo.svg"
                alt="ESG Horizon Logo"
                width={30}
                height={30}
                className="h-40 w-auto object-contain"
                priority
              />
            </div>

            <div className="bg-white ">
              <LoginForm />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
