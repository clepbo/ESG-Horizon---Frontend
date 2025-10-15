import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { ArrowRight } from "lucide-react";

interface AssessmentHubCardProps {
    icon: React.ElementType;
    iconBg: string;
    type: string;
    description: string;
    progress: number;
    completed: string;
}

export default function AssessmentHubCard({
    icon: Icon,
    iconBg,
    type,
    description,
    progress,
    completed,
}: AssessmentHubCardProps) {
    return (
        <Card className="bg-white border border-border hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${iconBg}`}>
                        <Icon className="w-6 h-6 text-white" />
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

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{completed}</p>
                </div>

                <Button
                    className={
                        "w-full bg-transparent border border-esg-green text-teal-500  transform hover:scale-[1.02] hover:text-white transition-colors" +
                        (progress <= 0
                            ? " !border-gray-400 !text-gray-600 hover:bg-transparent hover:text-gray-600"
                            : "")
                    }
                    disabled={progress <= 0}
                >
                    {progress <= 0 ? "Not started" : "Continue Assessment"}
                    {progress > 0 && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
            </CardContent>
        </Card>
    );
}
