"use client";

import StatusIndicator from "@/components/StatusIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { useStore } from "@/store/useStore";
import {
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  StopCircle,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Response = {
  timestamp: string;
  responseTime: number;
  statusCode: number;
};

const RESPONSES_PER_PAGE = 10;

export default function WebsiteDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { websites, removeWebsite, stopMonitoring } = useStore();
  const { sendMessage } = useWebSocketContext();
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const website = websites.find((w) => w.id === id);

  useEffect(() => {
    if (website) {
      setResponses((prev) => {
        const newResponse = {
          timestamp: new Date().toISOString(),
          responseTime: website.responseTime,
          statusCode: website.statusCode,
        };
        const newResponses = [newResponse, ...prev];
        return newResponses.slice(0, 50); // Keep only the most recent 50 responses
      });
    }
  }, [website?.responseTime, website?.statusCode]);

  const handleManualPing = useCallback(() => {
    if (website) {
      const pingMessage = {
        action: "ping",
        website: {
          userId: 1,
          projectId: website.id,
          url: website.url,
        },
      };
      sendMessage(JSON.stringify(pingMessage));
    }
  }, [website, sendMessage]);

  const handleStopMonitoring = useCallback(() => {
    if (website) {
      stopMonitoring(website.id);
      const message = {
        action: "stop",
        website: {
          userId: 1,
          projectId: website.id,
          url: website.url,
          interval: "THREE",
        },
      };
      sendMessage(JSON.stringify(message));
    }
  }, [website, stopMonitoring, sendMessage]);

  const handleRemoveWebsite = useCallback(() => {
    if (website) {
      handleStopMonitoring();
      removeWebsite(website.id);
      router.push("/");
    }
  }, [website, handleStopMonitoring, removeWebsite, router]);

  const totalPages = Math.ceil(responses.length / RESPONSES_PER_PAGE);
  const paginatedResponses = responses.slice(
    (currentPage - 1) * RESPONSES_PER_PAGE,
    currentPage * RESPONSES_PER_PAGE
  );

  const downtimeChartData =
    website?.downtime.map((dt) => ({
      startTime: new Date(dt.startTime).getTime(),
      duration: dt.duration,
    })) || [];

  if (!website) {
    return <div>Website not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">{website.url}</h1>
          <StatusIndicator isActive={website.isActive} size="lg" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleStopMonitoring}>
              <StopCircle className="mr-2 h-4 w-4" />
              <span>Stop Monitoring</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRemoveWebsite}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Remove Website</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Response Time: {website.responseTime}ms</p>
            <p>Status Code: {website.statusCode}</p>
            <Button onClick={handleManualPing} className="mt-4">
              Manual Ping
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Downtime Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid />
                  <XAxis
                    dataKey="startTime"
                    name="Time"
                    tickFormatter={(tick) => new Date(tick).toLocaleString()}
                    type="number"
                    domain={["dataMin", "dataMax"]}
                  />
                  <YAxis dataKey="duration" name="Duration (minutes)" />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} minutes`,
                      name === "duration" ? "Downtime" : name,
                    ]}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Scatter
                    name="Downtime"
                    data={downtimeChartData}
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Status Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedResponses.map((response, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(response.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{response.responseTime}ms</TableCell>
                    <TableCell>{response.statusCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
