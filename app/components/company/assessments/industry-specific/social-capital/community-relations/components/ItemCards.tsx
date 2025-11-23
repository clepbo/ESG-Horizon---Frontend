import CustomTooltip from "@/app/(company)/ranking/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/ranking/create/components/TooltipMessage";
import { Card, CardContent } from "@/app/components/ui/card";
import { ChevronRight } from "lucide-react";


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
