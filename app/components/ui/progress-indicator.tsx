import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                index < currentStep
                  ? "bg-green-600 text-white"
                  : index === currentStep
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-500",
              )}
            >
              {index + 1}
            </div>
            <span className="text-xs mt-2 text-center max-w-20">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn("h-0.5 w-16 mx-4 transition-colors", index < currentStep ? "bg-green-600" : "bg-gray-200")}
            />
          )}
        </div>
      ))}
    </div>
  )
}
