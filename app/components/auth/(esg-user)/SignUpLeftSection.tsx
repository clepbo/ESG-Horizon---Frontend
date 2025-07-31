"use client";

import Image from "next/image";

export default function SignUpLeftSection() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-[#0A2640] text-white items-center justify-center px-10">
      <div>
        <h1 className="text-4xl font-bold mb-6">Create your account</h1>
        <p className="text-lg">
          Join our platform and start managing your ESG reports today.
        </p>
      </div>
    </div>
  );
}
