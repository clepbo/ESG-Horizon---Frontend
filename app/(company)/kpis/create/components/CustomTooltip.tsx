"use client";

import { Info } from "lucide-react";
import { useEffect, useRef, useState, ReactNode } from "react";

interface TooltipButtonProps {
  detail: ReactNode; // can now be any JSX or string
}

const CustomTooltip: React.FC<TooltipButtonProps> = ({ detail }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    // Dynamically decide tooltip position
    setPosition(spaceAbove > spaceBelow ? "top" : "bottom");
  }, [visible]);

  return (
    <div
      ref={buttonRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(!visible)}
    >
      <button
        type="button"
        className="p-1 rounded-full text-muted-foreground hover:text-foreground focus:outline-none"
      >
        <sup>
          {" "}
          <Info className="w-4 h-4 text-gray-400" />
        </sup>
      </button>

      {visible && (
        <div
          className={`absolute z-10 w-max max-w-[200px] bg-primary text-white text-xs rounded-md px-3 py-2 shadow-md ${
            position === "top" ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {detail}
        </div>
      )}
    </div>
  );
};

export default CustomTooltip;
