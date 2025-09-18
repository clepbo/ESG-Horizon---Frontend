"use client";

import { useState } from "react";
import { User, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import Header from "@/app/(company)/components/Header";

interface TourCardProps {
    title: string;
    description: string;
    buttonText: string;
    href: string;
    onAction?: () => void;
}

function TourCard({
    title,
    description,
    buttonText,
    href,
    onAction,
}: TourCardProps) {
    const handleClick = () => {
        if (onAction) {
            onAction();
        } else {
            window.location.href = href;
        }
    };

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
                    onClick={handleClick}
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50 bg-transparent flex items-center justify-center gap-2 text-xs"
                >
                    {buttonText}
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </CardContent>
        </Card>
    );
}

interface ESGTourProps {
    firstName?: string;
    onComplete?: () => void;
}

export default function ESGTour({
    firstName = "User",
    onComplete,
}: ESGTourProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleContinueToDashboard = () => {
        setIsVisible(false);
        localStorage.setItem("esg-tour-completed", "true");
        if (onComplete) {
            onComplete();
        }
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
            href: "/settings-esg/subsidiaries",
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

    return (
        <div className="min-h-screen bg-[#F2FBF3] p-6">
            <Header />
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome {firstName},
                    </h1>
                    <p className="text-gray-600">What would you like to do?</p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {tourCards.map((card, index) => (
                        <TourCard
                            key={index}
                            title={card.title}
                            description={card.description}
                            buttonText={card.buttonText}
                            href={card.href}
                            onAction={card.onAction}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-600">
                    Need Help?{" "}
                    <a
                        href="mailto:support@esghorizon.com"
                        className="underline text-gray-900 hover:text-gray-700"
                    >
                        support@esghorizon.com
                    </a>
                </div>
            </div>
        </div>
    );
}
