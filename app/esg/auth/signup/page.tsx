// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { SignupForm } from "@/app/components/auth/SignupForm";
// import { OrganizationDetails } from "@/app/components/auth/OrganizationDetails";
// import { RequestSubmitted } from "@/app/components/auth/RequestSubmitted";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { SecuritySlider } from "@/app/components/SecuritySlider";

// export default function Index() {
//   const [currentStep, setCurrentStep] = useState<
//     "signup" | "organization" | "submitted"
//   >("signup");

//   const handleNextStep = () => setCurrentStep("organization");
//   const handleBackStep = () => setCurrentStep("signup");
//   const handleComplete = () => setCurrentStep("submitted");

//   if (currentStep === "submitted") {
//     return (
//       <>
//         <RequestSubmitted />
//         <ToastContainer theme="light" position="top-right" autoClose={3000} />
//       </>
//     );
//   }

//   return (
//     <>
//       <div className="min-h-screen flex flex-col lg:flex-row font-poppins">
//         {/* Left side with background image + green overlay + slider */}
//         <div className="relative hidden lg:flex w-full lg:w-[45%] px-12 py-6 min-h-screen">
//           {/* Background Image */}
//           <Image
//             src="/login-image.png"
//             alt="Login background"
//             fill
//             sizes="(min-width: 1024px) 45vw, 100vw"
//             className="absolute inset-0 z-0 object-cover"
//             priority
//           />

//           {/* Green Overlay */}
//           <div className="absolute inset-0 bg-green-600 opacity-50 z-10" />
//           <div className="absolute inset-0 bg-black opacity-50 z-10" />

//           {/* Content on overlay */}
//           <div className="relative z-20 flex flex-col justify-start items-start px-10 py6 w-full">
//             {/* Logo */}
//             <Image
//               src="/logo-new.png"
//               alt="ESG Horizon Logo"
//               width={120}
//               height={60}
//               priority
//               className="object-contain hidden md:block mb-6"
//               style={{ width: "auto", height: "auto" }}
//             />

//             {/* Header & Description */}
//             <div className=" text-white">
//               <h1 className="text-4xl font-medium mb-6">
//                 Join the Future of Responsible Reporting
//               </h1>
//               <p className="text-base text-white/90 max-w-md">
//                 Make your ESG data work for you. Track, manage, and showcase
//                 your environmental, social, and governance impact — all in one
//                 place. Start your journey toward smarter, transparent, and
//                 impactful sustainability today.
//               </p>
//             </div>

//             {/* Security Slider */}
//             <div className="mt-12">
//               <SecuritySlider />
//             </div>

//             {/* Decorative Bubbles */}
//             <div className="absolute top-20 right-8 w-32 h-32 bg-white/10 rounded-full" />
//             <div className="absolute bottom-20 right-16 w-20 h-20 bg-white/10 rounded-full" />
//           </div>
//         </div>

//         {/* Right side: Signup / Org Form */}
//         <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12 bg-white">
//           <div className="w-full max-w-lg space-y-6">
//             {currentStep === "signup" ? (
//               <SignupForm onNext={handleNextStep} />
//             ) : (
//               <OrganizationDetails
//                 onBack={handleBackStep}
//                 onNext={handleComplete}
//               />
//             )}
//           </div>
//         </div>
//       </div>

//       <ToastContainer theme="light" position="top-right" autoClose={3000} />
//     </>
//   );
// }
"use client";

import { useState } from "react";
import Image from "next/image";
import { SignupForm } from "@/app/components/auth/SignupForm";
import { OrganizationDetails } from "@/app/components/auth/OrganizationDetails";
import { RequestSubmitted } from "@/app/components/auth/RequestSubmitted";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SecuritySlider } from "@/app/components/SecuritySlider";
import { useAuth } from "@/context/AuthContext";
import type { SignupFormData } from "@/app/components/auth/SignupForm";
import type { OrganizationFormData } from "@/app/components/auth/OrganizationDetails";

export default function Index() {
  const [currentStep, setCurrentStep] = useState<
    "signup" | "organization" | "submitted"
  >("signup");

  const [personalData, setPersonalData] = useState<SignupFormData | null>(null);

  const { signup } = useAuth();

  const handlePersonalNext = (data: SignupFormData) => {
    setPersonalData(data);
    setCurrentStep("organization");
  };
  // Step 2 → merge & submit
  const handleOrganizationSubmit = (orgData: OrganizationFormData) => {
    if (!personalData) {
      toast.error("Missing personal data");
      return;
    }

    const payload = {
      email: personalData.workEmail,
      password: personalData.password,
      first_name: personalData.firstName,
      last_name: personalData.lastName,
      phone_number: personalData.phoneNumber, // Ensure includes +234 if required
      company_name: orgData.companyName,
      registration_number: orgData.registrationNumber, // ✅ fixed key
      industry_type: orgData.industry, // ✅ fixed key
      address: orgData.address,
      contact_email: orgData.contactEmail,
      contact_phone: orgData.contactPhone,
      company_website: orgData.website || "",
    };

    signup(payload)
      .then(() => {
        toast.success("Account created successfully!");
        setCurrentStep("submitted");
      })
      .catch((error) => {
        toast.error(error?.message || "Signup failed");
      });
  };

  if (currentStep === "submitted") {
    return (
      <>
        <RequestSubmitted />
        <ToastContainer theme="light" position="top-right" autoClose={3000} />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row font-poppins">
        {/* Left */}
        <div className="relative hidden lg:flex w-full lg:w-[45%] px-12 py-6 min-h-screen">
          <Image
            src="/login-image.png"
            alt="Login background"
            fill
            className="absolute inset-0 object-cover"
            priority
          />
          <div className="absolute inset-0 bg-green-600 opacity-50 z-10" />
          <div className="absolute inset-0 bg-black opacity-50 z-10" />
          <div className="relative z-20 flex flex-col justify-start items-start px-10">
            <Image
              src="/logo-new.png"
              alt="ESG Horizon Logo"
              width={120}
              height={60}
              priority
              className="mb-6 hidden md:block"
            />
            <div className="text-white">
              <h1 className="text-4xl font-medium mb-6">
                Join the Future of Responsible Reporting
              </h1>
              <p className="text-base text-white/90 max-w-md">
                Make your ESG data work for you. Track, manage, and showcase
                your environmental, social, and governance impact — all in one
                place.
              </p>
            </div>
            <div className="mt-12">
              <SecuritySlider />
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-12 bg-white">
          <div className="w-full max-w-lg space-y-6">
            {currentStep === "signup" ? (
              <SignupForm onNext={handlePersonalNext} /> // ✅ Passes data
            ) : (
              <OrganizationDetails
                onBack={() => setCurrentStep("signup")}
                onNext={handleOrganizationSubmit}
              />
            )}
          </div>
        </div>
      </div>
      <ToastContainer theme="light" position="top-right" autoClose={3000} />
    </>
  );
}
