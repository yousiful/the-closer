// StepIndicator — vertical step rail with animated connectors
// Design: Premium SaaS / Dark Intelligence theme

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
  sublabel: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export default function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = currentStep === step.id;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.id} className="flex gap-4">
            {/* Dot + connector column */}
            <div className="flex flex-col items-center">
              {/* Step dot */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-500 flex-shrink-0",
                  isCompleted
                    ? "border-[#D4A017] bg-[#D4A017]"
                    : isActive
                    ? "border-[#D4A017] bg-[#D4A017]/10 pulse-ring"
                    : "border-white/15 bg-white/5"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-[#0A0B14]" strokeWidth={3} />
                ) : (
                  <span
                    className={cn(
                      "text-sm font-bold font-mono",
                      isActive ? "text-[#D4A017]" : "text-white/30"
                    )}
                  >
                    {step.id}
                  </span>
                )}

                {/* Active glow ring */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full border border-[#D4A017]/40 scale-150 animate-ping" />
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="relative w-px flex-1 min-h-[40px] bg-white/10 my-1 overflow-hidden">
                  {isCompleted && (
                    <div
                      className="absolute top-0 left-0 w-full bg-[#D4A017] connector-fill"
                      style={{ height: "100%" }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Label column */}
            <div className={cn("pb-8", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-semibold leading-tight transition-colors duration-300",
                  isActive ? "text-[#D4A017]" : isCompleted ? "text-white/70" : "text-white/30"
                )}
              >
                {step.label}
              </p>
              <p
                className={cn(
                  "text-xs mt-0.5 transition-colors duration-300",
                  isActive ? "text-white/50" : "text-white/20"
                )}
              >
                {step.sublabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
