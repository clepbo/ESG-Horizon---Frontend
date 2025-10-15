"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const securityFeatures = [
  {
    icon: "/Secure.svg",
    title: "Secure",
    description:
      "Your data is protected with enterprise-grade security and encryption. Access is role-based, ensuring only the right people see the right information.",
  },
  {
    icon: "/Compliant.svg",
    title: "Fast & Reliable",
    description:
      "Lightning-fast data processing and real-time insights. Our platform scales with your needs, ensuring consistent performance across all your ESG metrics.",
  },
  {
    icon: "/Impact.svg",
    title: "Collaborative",
    description:
      "Built for teams. Share insights, collaborate on reports, and track progress together. Streamlined workflows for maximum efficiency.",
  },
];

export const SecuritySlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % securityFeatures.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto text-white flex">
      <div className="bg-[var(--color-primary)] opacity-80 rounded-xl px-6 py-6 text-center relative overflow-hidden shadow-md">
        {/* Slide container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="min-w-full flex-shrink-0 flex flex-col items-start justify-center gap-4 px-2 text-left"
              >
                <div className="flex items-center justify-start gap-2">
                  <div className="rounded-full flex items-center justify-center">
                    <Image
                      src={feature.icon}
                      alt={`${feature.title} icon`}
                      width={48}
                      height={48}
                      className="w-12 h-auto object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm leading-relaxed opacity-90 max-w-xs">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dot navigation */}
        <div className="flex justify-center mt-6 space-x-2">
          {securityFeatures.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors duration-300",
                index === currentSlide ? "bg-[var(--color-secondary)]" : "bg-green-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
