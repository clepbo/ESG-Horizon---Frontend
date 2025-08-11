import { TrendingUp, TrendingDown } from "lucide-react";

interface ESGScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  trend: "up" | "down";
  trendValue: string;
  icon: React.ReactNode;
  bgColor: string; // Background color class for the top section
  bottomBarColor?: string; // Optional footer background color
}

export function ESGScoreCard({
  title,
  score,
  maxScore,
  trend,
  trendValue,
  icon,
  bgColor,
  bottomBarColor = "bg-[#2c2c2c]",
}: ESGScoreCardProps) {
  const isTrendUp = trend === "up";

  return (
    <div className="rounded-xl overflow-hidden shadow-md w-full">
      {/* Card Top */}
      <div
        className={`p-4 h-[150px] flex flex-col justify-between ${bgColor} text-white`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-3xl font-bold mt-1">
              {score} / {maxScore}
            </p>
          </div>
          <div className="p-2 bg-white/30 rounded-lg">{icon}</div>
        </div>
      </div>

      {/* Card Bottom */}
      <div
        className={`px-4 py-3 text-white text-xs flex items-center justify-between ${bottomBarColor}`}
      >
        <p className="font-medium">From last report</p>
        <div
          className={`flex items-center gap-1 font-medium px-2 py-1 rounded-full ${
            isTrendUp
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isTrendUp ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{trendValue}</span>
        </div>
      </div>
    </div>
  );
}
