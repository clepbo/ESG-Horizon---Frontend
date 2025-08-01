import { Card, CardContent } from "@/app/(dashboard-esg)/components/ui/card";
import { Badge } from "@/app/(dashboard-esg)/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ESGScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  trend: "up" | "down";
  trendValue: string;
  bgColor: string;
  icon: React.ReactNode;
}

export function ESGScoreCard({
  title,
  score,
  maxScore,
  trend,
  trendValue,
  bgColor,
  icon,
}: ESGScoreCardProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <Card className={`${bgColor} border-0 text-white relative overflow-hidden`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold">{score}</span>
              <span className="text-lg opacity-75">/{maxScore}</span>
            </div>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-90">From last report</span>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0 text-xs px-2 py-0.5"
            >
              {trendValue}%
            </Badge>
          </div>

          {trend === "up" ? (
            <TrendingUp className="w-4 h-4 opacity-80" />
          ) : (
            <TrendingDown className="w-4 h-4 opacity-80" />
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-white/20 rounded-full h-1.5">
          <div
            className="bg-white rounded-full h-1.5 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
