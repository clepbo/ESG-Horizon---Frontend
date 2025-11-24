"use client";

import CustomTooltip from "@/app/(company)/ranking/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/ranking/create/components/TooltipMessage";
import { Card, CardContent } from "@/app/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { EvidenceItem } from "./AddMoreFIles";


export interface FeatureCardProps {
  title: string;
  tooltipTitle?: string;
  tooltipMessage?: string;
  subtitle: string;
  body: string;
  clickable?: boolean;
  onClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  tooltipTitle,
  tooltipMessage,
  subtitle,
  body,
  clickable = false,
  onClick,
}) => {
  return (
    <div className="mb-2">
      {/* ---------------- Title + Tooltip ---------------- */}
      <h5 className=" flex items-center gap-1">
        {title}

        {tooltipTitle && tooltipMessage && (
          <CustomTooltip
            detail={<TooltipMessage title={tooltipTitle} message={tooltipMessage} />}
          />
        )}
      </h5>

      {/* ---------------- Card ---------------- */}
      <Card
        className={`transition-colors shadow-sm max-w-lg bg-white rounded-lg border ${
          clickable ? "cursor-pointer hover:bg-accent/50" : "cursor-default"
        }`}
        onClick={() => clickable && onClick?.()}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Text Section */}
            <div className="space-y-1 flex-1">
              <h5 className="font-medium text-foreground">{subtitle}</h5>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>

            {/* Icon */}
            <ChevronRight className="h-7 w-7 text-muted-foreground shrink-0 ml-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};









export function EvidenceList() {
  const [items, setItems] = useState([0]);

  const addItem = () => {
    setItems(prev => [...prev, prev.length]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {items.map((_, index) => (
        <EvidenceItem
          key={index}
          index={index}
          onRemove={() => removeItem(index)}
        />
      ))}

      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={addItem}
      >
        <Plus className="h-4 w-4" />
        Add More Files/Links
      </Button>
    </div>
  );
}
