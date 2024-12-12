import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type UptimeData = {
  date: string;
  uptime: number;
  availability: number;
};

type UptimeAvailabilityChartProps = {
  data: UptimeData[];
};

const UptimeAvailabilityChart: React.FC<UptimeAvailabilityChartProps> = ({
  data,
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(label) => new Date(label).toLocaleString()}
          formatter={(value: number) => `${value.toFixed(2)}%`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="uptime"
          stroke="#8884d8"
          name="Uptime %"
        />
        <Line
          type="monotone"
          dataKey="availability"
          stroke="#82ca9d"
          name="Availability %"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default UptimeAvailabilityChart;
