import { cn } from "@/lib/utils";
import React from "react";

interface StatusIndicatorProps {
  isActive: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isActive,
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      <div
        className={cn(
          "absolute rounded-full",
          sizeClasses[size],
          isActive ? "bg-green-500" : "bg-red-500",
          "animate-pulse"
        )}
      />
      <div
        className={cn(
          "absolute rounded-full",
          sizeClasses[size],
          isActive ? "bg-green-500" : "bg-red-500",
          "opacity-75 animate-ping"
        )}
      />
    </div>
  );
};

export default StatusIndicator;
