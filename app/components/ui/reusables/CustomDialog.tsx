"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  offsetX?: number;
}

export default function CustomDialog({
  open,
  onOpenChange,
  title,
  children,
  className = "",
  offsetX = 0,
}: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{ marginLeft: offsetX }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            className={`relative bg-primary rounded-lg p-2 lg:p-6 shadow-lg w-full max-w-2xl mx-4 ${className}`}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              <button
                onClick={() => onOpenChange(false)}
                className="text-white hover:text-gray-400 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-auto overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
