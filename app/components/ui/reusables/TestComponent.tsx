"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ESGHorizonLanding() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        router.push("/login");
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex w-full items-center justify-center h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br **from-[color:var(--color-primary)]/30** **to-[color:var(--color-secondary)]/30** rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br **from-[color:var(--color-secondary)]/30** **to-[color:var(--color-tertiary)]/30** rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br **from-[color:var(--color-tertiary)]/20** **to-[color:var(--color-primary)]/20** rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div
        className={`flex flex-col items-center justify-center text-center transition-all duration-1000 transform ${
          isLoading ? "scale-100 opacity-100" : "scale-110 opacity-0"
        }`}
      >
        <div className="mb-8 relative">
          <div className="flex animate-fade-in-delay">
            <Image
              src="/Logo.svg"
              alt="ESG Horizon Logo"
              width={30}
              height={30}
              className="h-80 w-auto object-contain"
              priority
            />
          </div>
          {/* <div className="w-32 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto mt-4 rounded-full animate-pulse"></div> */}
        </div>

        <p className="text-xl md:text-2xl text-gray-600 mb-8 animate-fade-in-delay font-light max-w-md">
          Sustainable Future, Clear Vision
        </p>
        <div className="flex items-center gap-3 animate-fade-in-delay-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-100" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce delay-200" />
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" />
          </div>
          <span className="text-gray-500 font-light text-start">
            Loading...
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out 0.5s both;
        }

        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 1s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 1.5s both;
        }
      `}</style>
    </div>
  );
}
