"use client";

import { useState, useEffect } from "react";
import { Shield, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const securityFeatures = [
  {
    icon: Shield,
    title: "Secure",
    description:
      "Your data is protected with enterprise-grade security and encryption. Access is role-based, ensuring only the right people see the right information.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description:
      "Lightning-fast data processing and real-time insights. Our platform scales with your needs, ensuring consistent performance across all your ESG metrics.",
  },
  {
    icon: Users,
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

  const currentFeature = securityFeatures[currentSlide];
  const CurrentIcon = currentFeature.icon;

  return (
    <div className="bg-esg-dark-green rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg min-h-[220px] flex flex-col justify-between">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center transition-all duration-500">
          <CurrentIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">{currentFeature.title}</h3>
          <p className="text-sm leading-relaxed opacity-90 max-w-xl">
            {currentFeature.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-start mt-6 space-x-2">
        {securityFeatures.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === currentSlide ? "bg-white" : "bg-white/30"
            )}
          />
        ))}
      </div>

      {/* Subtle background light animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-10" />
      </div>
    </div>
  );
};
