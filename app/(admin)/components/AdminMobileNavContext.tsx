"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AdminMobileNavState {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const Ctx = createContext<AdminMobileNavState | null>(null);

export function AdminMobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, setOpen, toggle: () => setOpen((v) => !v) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminMobileNav(): AdminMobileNavState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Safe fallback if used outside provider — prevents crashes during route transitions
    return { open: false, setOpen: () => {}, toggle: () => {} };
  }
  return ctx;
}
