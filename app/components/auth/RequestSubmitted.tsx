"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import { Checkmark } from "../CheckMark";

export const RequestSubmitted = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 font-poppins">
      {/* Background Image */}
      <Image
        src="/login-flow-background-image.png"
        alt="Background"
        fill
        sizes="100vw"
        className="absolute inset-0 object-cover z-0"
        priority
      />

      {/* Foreground Content */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-xl shadow-xl px-10 py-12 max-w-md w-full text-center">
        <Checkmark />
        <h1 className="text-2xl font-semibold text-esg-green mb-4">
          Request Submitted
        </h1>
        <p className="text-gray-700 mb-8 text-sm leading-relaxed">
          Your sign-up request has been submitted. You’ll be notified once it’s
          reviewed.
        </p>

        <Button
          onClick={handleContinue}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-sm rounded-md cursor-pointer"
        >
          Continue to website
        </Button>
      </div>
    </div>
  );
};
