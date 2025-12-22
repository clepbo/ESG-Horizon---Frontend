"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { useRouter } from "next/navigation";
import React from "react";

export default function StartAssessment() {
  const router = useRouter();
  return (
    <div>
      <Card className="max-w-4xl w-full mx-auto p-15 rounded-md bg-white border-none mb-10 shadow-md">
        <CardContent className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-6 text-neutral-1000">Welcome To Target</h1>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed text-center">
            It looks like you haven&apos;t started any yet. Click on the
            <br />
            button below to get started with assessment, before proceeding to target setting.
          </p>

          <Button
            onClick={() => router.push("/assessments/hub")}
            className="bg-[var(--color-primary)] transform hover:scale-[1.02] text-white px-8 py-4 text-sm rounded-sm"
          >
            Start New Assessment
          </Button>
          <p className="mt-6 text-sm text-gray-600 mb-10 leading-relaxed text-center">
            Or, have a lot of data? You can also{" "}
            <strong
              onClick={() => alert("Coming soon!")}
              style={{ cursor: "pointer", color: "black", textDecoration: "none" }}
            >
              Bulk Upload
            </strong>{" "}
            our assessments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
