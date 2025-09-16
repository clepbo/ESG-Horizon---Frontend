"use client";

import { handleAxiosError } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

interface CodeInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    newPassword: string;
    onVerifySuccess: () => void;
}

export default function CodeInputModal({
    isOpen,
    onClose,
    email,
    newPassword,
    onVerifySuccess,
}: CodeInputModalProps) {
    const [otpCode, setOtpCode] = useState<string[]>(Array(4).fill(""));
    const [loading, setLoading] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(60);
    const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [countdown]);

    if (!isOpen) {
        return null;
    }

    const onOtpChange = (value: string, index: number) => {
        if (/^\d?$/.test(value)) {
            const newCode = [...otpCode];
            newCode[index] = value;
            setOtpCode(newCode);

            if (value && index < 3) {
                otpInputsRef.current[index + 1]?.focus();
            }
        }
    };

    const onOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace" && !otpCode[index] && index > 0) {
            otpInputsRef.current[index - 1]?.focus();
        }
    };

    const onOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = otpCode.join("");

        if (otp.length !== 4) {
            toast.error("Please enter the 4-digit code.");
            return;
        }

        setLoading(true);
        try {
            await authService.verifyOtp({ email, otp });
            toast.success("Code verified successfully!");
            onVerifySuccess();
            await authService.resetPassword({
                email,
                otp,
                new_password: newPassword,
            });
            onClose();
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const onResendCode = async () => {
        try {
            await authService.forgotPassword({ email });
            setCountdown(60);
            toast.success("Verification code resent!");
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-filter backdrop-blur-sm">
            <div className="relative bg-white rounded-lg border border-neutral-200 p-8 shadow-sm w-full max-w-md space-y-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-900"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x"
                    >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </button>
                <header>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                        Email Verification
                    </h2>
                    <p className="text-sm text-neutral-600">
                        Enter the 4-digit code sent to{" "}
                        <span className="font-semibold break-all">{email}</span>
                    </p>
                </header>
                <form onSubmit={onOtpSubmit} className="space-y-6">
                    <div className="flex gap-2 items-center justify-center">
                        {otpCode.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) =>
                                    onOtpChange(e.target.value, index)
                                }
                                onKeyDown={(e) => onOtpKeyDown(e, index)}
                                ref={(el) => {
                                    if (el) otpInputsRef.current[index] = el;
                                }}
                                className="w-12 h-12 border border-neutral-300 rounded text-center text-lg outline-none text-black focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            />
                        ))}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 text-sm font-semibold rounded-md text-white transition cursor-pointer ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                        }`}
                    >
                        {loading ? "Verifying..." : "Verify Code"}
                    </button>
                    <div className="text-sm text-neutral-600 mt-4 space-y-1 text-center">
                        <p>
                            Didn’t receive code?{" "}
                            {countdown > 0 ? (
                                <span className="text-neutral-500">
                                    Resend in {countdown}s
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onResendCode}
                                    className="text-neutral-900 font-medium hover:underline"
                                >
                                    Resend code
                                </button>
                            )}
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
