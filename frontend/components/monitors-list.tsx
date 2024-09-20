"use client";

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
import { useState } from "react";

type Monitor = {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "degraded";
  uptime: string;
  lastChecked: string;
};

const mockMonitors: Monitor[] = [
  {
    id: "1",
    name: "Main Website",
    url: "https://example.com",
    status: "up",
    uptime: "99.9%",
    lastChecked: "2 minutes ago",
  },
  {
    id: "2",
    name: "API Endpoint",
    url: "https://api.example.com",
    status: "degraded",
    uptime: "98.5%",
    lastChecked: "5 minutes ago",
  },
  {
    id: "3",
    name: "User Dashboard",
    url: "https://dashboard.example.com",
    status: "down",
    uptime: "95.0%",
    lastChecked: "1 minute ago",
  },
];

export function MonitorsList() {
  const [monitors, setMonitors] = useState<Monitor[]>(mockMonitors);

  const handleDeleteMonitor = (id: string) => {
    setMonitors(monitors.filter((monitor) => monitor.id !== id));
  };

  const statusIcon = (status: Monitor["status"]) => {
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
          {monitors.map((monitor) => (
            <div
              key={monitor.id}
              className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center space-x-4">
                {statusIcon(monitor.status)}
                <div>
                  <Link
                    href={`/monitors/${monitor.id}`}
                    className="font-medium hover:underline"
                  >
                    {monitor.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{monitor.url}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Uptime: {monitor.uptime}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last checked: {monitor.lastChecked}
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
                      onSelect={() => handleDeleteMonitor(monitor.id)}
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
