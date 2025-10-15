"use client";

import { FC, useEffect, useState } from "react";
import { User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

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
        <Card className="h-full flex flex-col p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex-1 text-center p-0">
                <CardTitle className="text-sm font-medium text-gray-900 mb-2">
                    {title}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 leading-snug px-2">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 px-0">
                <Button
                    onClick={onClick}
                    variant="outline"
                    className="w-full border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-green-50 bg-transparent flex items-center justify-center gap-2 text-xs"
                    disabled={allButtonsDisabled}
                >
                    {isCurrentLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

const ESGTour: FC<ESGTourProps> = ({
    firstName = "User",
    onComplete,
}: ESGTourProps) => {
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const { user } = useAuth();

    const handleCardClick = (
        index: number,
        href: string,
        onAction?: () => void
    ): void => {
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
            title: "Complete Company Profile",
            description:
                "Add basic company details (name, industry, location, size).",
            buttonText: "Complete Company Profile",
            href: "/settings-esg/company",
        },
        {
            title: "Complete Your Profile",
            description:
                "Add basic details (phone number, profile photo, etc).",
            buttonText: "Complete Your Profile",
            href: "/settings-esg/account",
        },
        {
            title: "Set Up Teams, Departments or Subsidiary",
            description:
                "Create departments and invite team members. Assign roles (Admin, Editor, Viewer).",
            buttonText: "Set Up Departments & Teams",
            href: "/settings-esg/subsidiaries?setup=true",
        },
        {
            title: "Start First Assessment",
            description:
                "Launch GHG (Scope 1, 2, or 3) or ESG metric assessments.",
            buttonText: "Start First Assessment",
            href: "/assessments",
        },
        {
            title: "View Tutorials or Walkthrough",
            description:
                "Quick interactive guide on using the platform effectively.",
            buttonText: "View Tutorials or Walkthrough",
            href: "#",
        },
        {
            title: "Continue To Dashboard",
            description:
                "Move into the main dashboard to begin full platform use.",
            buttonText: "Continue To Dashboard",
            href: "/dashboard-esg",
            onAction: handleContinueToDashboard,
        },
    ];

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
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center relative">
                                {user && user.profile_photo_url ? (
                                    <Image
                                        src={
                                            user.profile_photo_url ||
                                            "/image.png"
                                        }
                                        alt={`${user.first_name} photo`}
                                        className="rounded-full object-cover"
                                        fill
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-gray-600" />
                                )}
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Welcome {firstName},
                        </h1>
                        <p className="text-gray-600">
                            What would you like to do?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                                onClick={() =>
                                    handleCardClick(
                                        index,
                                        card.href,
                                        card.onAction
                                    )
                                }
                            />
                        ))}
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <p className="mb-2">
                            <button
                                onClick={handleOptOut}
                                className="underline text-gray-900 hover:text-gray-700 font-medium transition-colors cursor-pointer"
                            >
                                Want to stop seeing this welcome tour page? Opt
                                Out.
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
                        <h3 className="text-lg font-bold mb-4">
                            Confirm Opt-Out
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to stop seeing this Welcome
                            Tour Page? You can&apos;t undo this action.
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
