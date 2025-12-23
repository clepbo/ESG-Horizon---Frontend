"use client";

import { FC, useEffect, useState } from "react";
import { User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { companyService } from "@/services/company.service";

interface TourCardProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  onAction?: () => void;
  isCurrentLoading?: boolean;
  allButtonsDisabled: boolean;
  onClick: () => void;
}

function TourCard({
  title,
  description,
  buttonText,
  isCurrentLoading,
  allButtonsDisabled,
  onClick,
}: TourCardProps) {
  return (
    <Card className="h-full flex flex-col p-5 shadow-sm border border-gray-100 rounded-xl bg-white">
      <CardHeader className="flex-1 text-center p-0 space-y-2.5">
        <CardTitle className="text-[15px] font-semibold text-gray-800 leading-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-[12px] text-gray-500 leading-relaxed px-1">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 px-0">
        <Button
          onClick={onClick}
          variant="outline"
          className="w-full h-10 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-green-50 bg-transparent flex items-center justify-center gap-2 text-[12px] font-medium rounded-lg"
          disabled={allButtonsDisabled}
        >
          {isCurrentLoading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              {buttonText}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

interface ESGTourProps {
  firstName?: string;
  onComplete?: () => void;
}

const ESGTour: FC<ESGTourProps> = ({ firstName = "User", onComplete }: ESGTourProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const { user } = useAuth();

  const [onboardingData, setOnboardingData] = useState<{
    progressPercent: number;
    checklist: { title: string; isCompleted: boolean }[];
  } | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      const data = await companyService.getOnboardingProgress();
      setOnboardingData(data);
    } catch (err) {
      console.error("Failed to fetch onboarding progress", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleCardClick = (index: number, href: string, onAction?: () => void): void => {
    setLoadingIndex(index);
    setTimeout(() => {
      if (onAction) {
        onAction();
      } else {
        window.location.href = href;
      }
    }, 500);
  };

  useEffect(() => {
    setLoadingIndex(null);
  }, []);

  const handleContinueToDashboard = () => {
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleOptOut = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmOptOut = () => {
    localStorage.setItem("esg-tour-completed", "true");
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleCancelOptOut = () => {
    setShowConfirmDialog(false);
  };

  if (!isVisible) {
    return null;
  }

  const tourCards = [
    {
      title: "Complete Organization & Personal Profile",
      description: "Set up your company and personal details to personalize your dashboard and unlock all platform features.",
      buttonText: "Complete Profile",
      href: "/settings-esg/company",
      isCompleted: onboardingData?.checklist[0]?.isCompleted ?? false,
    },
    {
      title: "Invite Your Teams, Set Up Departments & Subsidiaries",
      description: "Add team members, assign roles, and structure your departments or subsidiaries for seamless collaboration.",
      buttonText: "Start Now",
      href: "/settings-esg/subsidiaries?setup=true",
      isCompleted: onboardingData?.checklist[1]?.isCompleted ?? false,
    },
    {
      title: "Start First Assessment",
      description: "Begin your ESG assessment and start capturing the data needed for reporting and performance tracking.",
      buttonText: "Start Now",
      href: "/assessments",
      isCompleted: onboardingData?.checklist[2]?.isCompleted ?? false,
    },
    {
      title: "View ESG Dashboard",
      description: "See your company's ESG performance, track progress, and access key insights from all your assessments.",
      buttonText: "View Dashboard",
      href: "/dashboard-esg",
      isCompleted: onboardingData?.checklist[3]?.isCompleted ?? false,
      onAction: handleContinueToDashboard,
    },
  ];

  const progressPercent = onboardingData?.progressPercent ?? 0;

  const allButtonsDisabled: boolean = loadingIndex !== null;

  const mainContentClasses = showConfirmDialog
    ? "min-h-screen bg-[#F2FBF3] p-6 blur-sm pointer-events-none"
    : "min-h-screen bg-[#F2FBF3] p-6";

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      }}
    >
      <div className={mainContentClasses}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center relative border-2 border-white shadow-sm overflow-hidden">
                {user && user.profile_photo_url ? (
                  <Image
                    src={user.profile_photo_url || "/image.png"}
                    alt={`${user.first_name} photo`}
                    className="object-cover"
                    fill
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1.5 tracking-tight">
              Welcome {firstName},
            </h1>
            <p className="text-lg text-gray-500 font-medium">What would you like to do?</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start mb-10">
            {/* Left Sidebar: Progress Checklist */}
            <div className="w-full lg:w-[32%] flex flex-col gap-4">
              <div className="flex justify-between items-end mb-0.5 px-0.5">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Set Up Progress</span>
                <span className="text-xs font-bold text-gray-600">{progressPercent}% Complete</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[var(--color-primary)] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white">
                <CardContent className="p-6 space-y-5">
                  {isDataLoading ? (
                    <div className="py-6 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    tourCards.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-700 leading-snug">
                            {idx + 1}. {item.title}
                          </p>
                        </div>
                        <div
                          className={`w-5.5 h-5.5 rounded flex items-center justify-center border-2 transition-colors duration-300 ${item.isCompleted
                            ? "bg-transparent border-[var(--color-primary)] text-[var(--color-primary)]"
                            : "bg-transparent border-gray-200 text-transparent"
                            }`}
                        >
                          <motion.div
                            initial={false}
                            animate={item.isCompleted ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={4}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Side: Action Cards Grid */}
            <div className="w-full lg:w-[68%]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tourCards.map((card, index) => (
                  <TourCard
                    key={index}
                    title={card.title}
                    description={card.description}
                    buttonText={card.buttonText}
                    href={card.href}
                    onAction={card.onAction}
                    isCurrentLoading={loadingIndex === index}
                    allButtonsDisabled={allButtonsDisabled}
                    onClick={() => handleCardClick(index, card.href, card.onAction)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <button
                onClick={handleOptOut}
                className="underline text-gray-900 hover:text-gray-700 font-medium transition-colors cursor-pointer"
              >
                Want to stop seeing this welcome tour page? Opt Out.
              </button>
            </p>
            Need Help?{" "}
            <a
              href="mailto:esghorizon@gmail.com"
              className="underline text-gray-900 hover:text-gray-700"
            >
              esghorizon@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-6 bg-white w-96 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-bold mb-4">Confirm Opt-Out</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to stop seeing this Welcome Tour Page? You can&apos;t undo this
              action.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleConfirmOptOut}
                className="px-5 py-2 text-sm rounded-xs bg-red-500 hover:bg-red-600 text-white"
              >
                Yes, Opt Out
              </Button>
              <Button
                onClick={handleCancelOptOut}
                variant="outline"
                className="px-5 py-2 text-sm rounded-xs border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ESGTour;
