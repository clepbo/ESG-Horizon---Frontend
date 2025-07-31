"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/(esg-sign-up)/components/ui/button";

interface RequestSubmittedProps {
  onContinue?: () => void;
}

export const RequestSubmitted = ({ onContinue }: RequestSubmittedProps) => {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/loginpage");
  };

  return (
    <div className="min-h-screen bg-green-500 flex items-center justify-center px-4 font-poppins">
      <div className="bg-white rounded-xl shadow-xl px-10 py-12 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-esg-green mb-4">
          Request Submitted
        </h1>
        <p className="text-gray-700 mb-8 text-sm leading-relaxed">
          Your sign-up request has been submitted. You’ll be notified once it’s
          reviewed.
        </p>

        <Button
          onClick={handleContinue}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-sm rounded-md cursor pointer"
        >
          Continue to website
        </Button>
      </div>
    </div>
  );
};
