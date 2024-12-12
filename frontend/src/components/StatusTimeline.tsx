"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import StatusIndicator from "./StatusIndicator";

type StatusTimelineProps = {
  checks: Array<{
    timestamp: string;
    statusCode: number;
  }>;
  className?: string;
  interval?: string;
};

export function StatusTimeline({
  checks,
  className,
  interval,
}: StatusTimelineProps) {
  const recentChecks = checks.slice(-32);
  const lastCheck = recentChecks[recentChecks.length - 1];
  const timeAgo =
    recentChecks.length > 0
      ? new Date(recentChecks[0].timestamp).toLocaleTimeString()
      : "";
  const now = new Date().toLocaleTimeString();

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {recentChecks.map((check, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-8 rounded-full",
                  check.statusCode === 200 ? "bg-green-500" : "bg-red-500"
                )}
              />
            ))}
          </div>
        </div>

        <StatusIndicator isActive={lastCheck?.statusCode === 200} size="lg" />
        {/* <div
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            lastCheck?.statusCode === 200
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          )}
        >
          {lastCheck?.statusCode === 200 ? "Up" : "Down"}
        </div> */}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{timeAgo}</span>
        <span>now</span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Check every {interval} seconds
      </div>
    </Card>
  );
}
