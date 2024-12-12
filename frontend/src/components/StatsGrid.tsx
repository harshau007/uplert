"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsGridProps = {
  checks: Array<{
    timestamp: string;
    responseTime: number;
    statusCode: number;
  }>;
};

export function StatsGrid({ checks }: StatsGridProps) {
  const lastCheck = checks[checks.length - 1];
  const last24Hours = checks.filter(
    (check) =>
      new Date(check.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );
  const last30Days = checks.filter(
    (check) =>
      new Date(check.timestamp).getTime() >
      Date.now() - 30 * 24 * 60 * 60 * 1000
  );

  const currentResponse = lastCheck?.responseTime || 0;
  const currentStatusCode = lastCheck?.statusCode || 0;
  const avgResponse24h = Math.floor(
    last24Hours.reduce((sum, check) => sum + check.responseTime, 0) /
      last24Hours.length
  );
  const uptime24h =
    (last24Hours.filter((check) => check.statusCode === 200).length /
      last24Hours.length) *
    100;
  const uptime30d =
    (last30Days.filter((check) => check.statusCode === 200).length /
      last30Days.length) *
    100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response</CardTitle>
          <span className="text-xs text-muted-foreground">(Current)</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentResponse} ms</div>
          <p
            className={cn(
              "text-sm mt-1",
              currentStatusCode === 200 ? "text-green-600" : "text-red-600"
            )}
          >
            Status: {currentStatusCode}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Response</CardTitle>
          <span className="text-xs text-muted-foreground">(24-hour)</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgResponse24h} ms</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          <span className="text-xs text-muted-foreground">(24-hour)</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uptime24h.toFixed(2)}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          <span className="text-xs text-muted-foreground">(30-day)</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uptime30d.toFixed(2)}%</div>
        </CardContent>
      </Card>
    </div>
  );
}
