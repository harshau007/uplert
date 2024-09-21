import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface MonitoringData {
  url: string;
  status: "up" | "down" | "degraded";
  response_time: string;
}

interface MonitorsListProps {
  monitoringData: {
    [url: string]: MonitoringData[];
  };
}

export function MonitorsList({ monitoringData }: MonitorsListProps) {
  const handleDeleteMonitor = (url: string) => {
    // Implement delete functionality
    console.log(`Delete monitor for ${url}`);
  };

  const statusIcon = (status: "up" | "down" | "degraded") => {
    switch (status) {
      case "up":
        return <CheckCircle className="text-green-500" />;
      case "down":
        return <XCircle className="text-red-500" />;
      case "degraded":
        return <AlertCircle className="text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {Object.entries(monitoringData).map(([url, data]) => {
            const latestData = data[0];
            return (
              <div
                key={url}
                className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center space-x-4">
                  {statusIcon(latestData.status)}
                  <div>
                    <Link
                      href={`/monitors/${encodeURIComponent(url)}`}
                      className="font-medium hover:underline"
                    >
                      {url}
                    </Link>
                    <p className="text-sm text-muted-foreground">{url}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Status: {latestData.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Response time: {latestData.response_time}
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
                        onSelect={() => handleDeleteMonitor(url)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
