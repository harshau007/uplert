"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ResponseTimeChartProps = {
  checks: Array<{
    timestamp: string;
    responseTime: number;
    statusCode: number;
  }>;
};

export function ResponseTimeChart({ checks }: ResponseTimeChartProps) {
  const last2Hours = checks.filter(
    (check) =>
      new Date(check.timestamp).getTime() > Date.now() - 2 * 60 * 60 * 1000
  );

  // Find downtime periods
  const downtimePeriods = last2Hours.reduce((periods: any[], check, index) => {
    if (check.statusCode !== 200 && index > 0) {
      if (periods.length > 0 && !periods[periods.length - 1].end) {
        // Extend current period
        return periods;
      }
      // Start new period
      return [...periods, { start: check.timestamp, end: null }];
    }
    if (
      check.statusCode === 200 &&
      periods.length > 0 &&
      !periods[periods.length - 1].end
    ) {
      // End current period
      periods[periods.length - 1].end = check.timestamp;
    }
    return periods;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={last2Hours}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis
                domain={[0, "dataMax + 100"]}
                tickFormatter={(value) => `${value}ms`}
              />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              {downtimePeriods.map((period: any, index: number) => (
                <ReferenceArea
                  key={index}
                  x1={period.start}
                  x2={period.end || last2Hours[last2Hours.length - 1].timestamp}
                  fill="#FEE2E2"
                />
              ))}
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
