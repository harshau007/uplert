"use client";

import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Dummy data for the dot chart
const data = [
  { date: "2023-05-01", downtime: 5 },
  { date: "2023-05-03", downtime: 10 },
  { date: "2023-05-07", downtime: 3 },
  { date: "2023-05-12", downtime: 8 },
  { date: "2023-05-18", downtime: 15 },
  { date: "2023-05-25", downtime: 7 },
  { date: "2023-05-30", downtime: 2 },
];

export default function DowntimeDotChart() {
  return (
    <Card className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis dataKey="date" name="Date" />
          <YAxis dataKey="downtime" name="Downtime (minutes)" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="Downtime" data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );
}
