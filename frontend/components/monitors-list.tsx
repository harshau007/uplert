import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, CheckCircle, XCircle, Clock, HelpCircle } from "lucide-react";
import Link from "next/link";

interface MonitoringData {
  url: string;
  status: "up" | "down" | "degraded" | "pending" | "unknown";
  response_time: string;
  interval: string;
}

interface MonitorsListProps {
  monitoringData: {
    [url: string]: MonitoringData;
  };
  hasMonitors: boolean;
  onDeleteMonitor: (url: string) => void;
}

export function MonitorsList({ monitoringData, hasMonitors, onDeleteMonitor }: MonitorsListProps) {
  const handleDeleteMonitor = (url: string) => {
    if (confirm(`Are you sure you want to delete the monitor for ${url}?`)) {
      onDeleteMonitor(url);
    }
  };

  const statusIcon = (status: MonitoringData['status']) => {
    switch (status) {
      case "up":
        return <CheckCircle className="text-green-500" />;
      case "down":
        return <XCircle className="text-red-500" />;
      case "degraded":
        return <AlertCircle className="text-yellow-500" />;
      case "pending":
        return <Clock className="text-blue-500" />;
      case "unknown":
      default:
        return <HelpCircle className="text-gray-500" />;
    }
  };

  return (
    <Card className={hasMonitors ? "" : "bg-transparent"}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {Object.values(monitoringData).map((data) => (
            <div
              key={data.url}
              className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center space-x-4">
                {statusIcon(data.status)}
                <div>
                  <Link
                    href={`/monitors/${encodeURIComponent(data.url)}`}
                    className="font-medium hover:underline"
                  >
                    {data.url}
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Status: {data.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Response time: {Number(data.response_time) / 1000000}ms
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      •••
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => handleDeleteMonitor(data.url)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
