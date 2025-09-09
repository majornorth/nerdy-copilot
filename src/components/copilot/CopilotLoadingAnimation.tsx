import React from "react";
import { cn } from "../../utils/cn";

interface CopilotLoadingAnimationProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CopilotLoadingAnimation({
  size = "md",
  className,
}: CopilotLoadingAnimationProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Full circle with gradient */}
      <div 
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          backgroundImage: `conic-gradient(from 90deg, 
            rgba(219, 0, 255, 1) 0%, 
            rgba(228, 11, 191, 1) 5%, 
            rgba(237, 23, 128, 1) 10%, 
            rgba(242, 29, 96, 1) 12.5%, 
            rgba(246, 34, 64, 1) 15%, 
            rgba(251, 40, 32, 1) 17.5%, 
            rgba(253, 43, 16, 1) 18.75%, 
            rgba(255, 46, 0, 1) 20%, 
            rgba(250, 43, 16, 1) 23.094%, 
            rgba(245, 40, 32, 1) 26.188%, 
            rgba(235, 34, 64, 1) 32.375%, 
            rgba(224, 29, 96, 1) 38.562%, 
            rgba(214, 23, 128, 1) 44.75%, 
            rgba(194, 11, 191, 1) 57.125%, 
            rgba(173, 0, 255, 1) 69.5%, 
            rgba(130, 6, 255, 1) 77.125%, 
            rgba(87, 13, 255, 1) 84.75%, 
            rgba(43, 19, 255, 1) 92.375%, 
            rgba(22, 22, 255, 1) 96.187%, 
            rgba(11, 24, 255, 1) 98.094%, 
            rgba(0, 26, 255, 1) 100%)`,
          animationDuration: '2s'
        }}
      />

      {/* Border overlay */}
      <div className="absolute inset-0 rounded-full border-[1.5px] border-[#d800ff] pointer-events-none" />
    </div>
  );
}