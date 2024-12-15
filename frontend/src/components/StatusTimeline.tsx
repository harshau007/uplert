"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import StatusIndicator from "./StatusIndicator";

type Check = {
  timestamp: string;
  statusCode: number;
};

type StatusTimelineProps = {
  checks: Check[];
  interval?: number;
  className?: string;
};

export function StatusTimeline({ checks, className }: StatusTimelineProps) {
  const recentChecks = checks.slice(0, 32).reverse();
  const lastCheck = recentChecks[recentChecks.length - 1];
  const timeAgo =
    recentChecks.length > 0
      ? new Date(
          recentChecks[recentChecks.length - 1].timestamp
        ).toLocaleTimeString()
      : "";
  const now = new Date().toLocaleTimeString();

  return (
    <Card className={cn("p-4 sm:p-6", className)}>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 sm:gap-6">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex gap-1 overflow-x-auto max-w-full">
            {recentChecks.map((check, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-6 sm:h-8 rounded-full flex-shrink-0",
                  check.statusCode === 200 ? "bg-green-500" : "bg-red-500"
                )}
              />
            ))}
          </div>
        </div>
        <div
          className={cn(
            "px-2 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 self-start sm:self-auto",
            lastCheck?.statusCode === 200
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          )}
        >
          <StatusIndicator isActive={lastCheck?.statusCode === 200} size="lg" />
        </div>
      </div>
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span>{timeAgo}</span>
        <span>{now}</span>
      </div>
    </Card>
  );
}
