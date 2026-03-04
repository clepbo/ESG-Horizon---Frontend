import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { ArrowRight, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AssessmentHubCardProps {
  icon?: React.ElementType;
  iconSrc?: string;
  type: string;
  description: string;
  progress: number;
  completed: string;
  assessmentId?: number | null;
  pillarStatus?: "not-started" | "in-progress" | "completed";
  assessmentStatus?: string | null;
}

export default function AssessmentHubCard({
  icon: Icon,
  iconSrc,
  type,
  description,
  progress,
  completed,
  assessmentId,
  pillarStatus = "not-started",
  assessmentStatus,
}: AssessmentHubCardProps) {
  const FallbackIcon = Icon || Zap;
  const router = useRouter();

  const isAssessmentEditable = assessmentStatus === "in_progress";
  const pillarTab = type.toLowerCase();

  const getButtonConfig = () => {
    // No work started for this pillar → start new
    if (pillarStatus === "not-started") {
      return {
        label: "Start Assessment",
        onClick: () => router.push(`/assessments/new-assessment?tab=${pillarTab}`),
      };
    }

    // Pillar in progress and assessment is editable → continue
    if (pillarStatus === "in-progress" && isAssessmentEditable) {
      return {
        label: "Continue Assessment",
        onClick: () => router.push(`/assessments/${assessmentId}`),
      };
    }

    // Pillar completed but assessment still in progress (other pillars may be incomplete)
    if (pillarStatus === "completed" && isAssessmentEditable) {
      return {
        label: "Continue Assessment",
        onClick: () => router.push(`/assessments/${assessmentId}`),
      };
    }

    // Assessment submitted/approved → view or start new
    if (!isAssessmentEditable && assessmentId) {
      return {
        label: "Start New Assessment",
        onClick: () => router.push("/assessments"),
      };
    }

    // Fallback
    return {
      label: "Start Assessment",
      onClick: () => router.push(`/assessments/new-assessment?tab=${pillarTab}`),
    };
  };

  const { label, onClick } = getButtonConfig();

  return (
    <Card className="bg-white border border-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-start gap-4">
          <div className={` rounded-lg flex items-center justify-center `}>
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt={`${type} icon`}
                width={24}
                height={24}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <FallbackIcon className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-foreground">
              {type} Assessment
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{completed}</p>
          </div>
        )}

        <Button
          className={
            "w-full bg-transparent border border-esg-green text-teal-500 transform hover:scale-[1.02] hover:text-white transition-colors"
          }
          onClick={onClick}
        >
          {label}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
