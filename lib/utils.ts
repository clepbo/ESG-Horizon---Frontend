import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// logout handler
let logoutFunc: (() => void) | null = null;

export const registerLogout = (fn: () => void) => {
    logoutFunc = fn;
};

export const triggerLogout = () => {
    if (logoutFunc) logoutFunc();
};
