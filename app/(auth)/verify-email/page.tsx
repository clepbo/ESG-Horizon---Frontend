"use client";
import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";
import Spinner from "../../components/ui/reusables/Spinner";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
