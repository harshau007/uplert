"use client";

import { AreaChartComponent } from "@/components/cbarts/area";
import StatusIndicator from "@/components/statusIndicator";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PauseCircle, SendHorizontal, Settings } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type Monitor = {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "degraded";
  uptime: string;
  lastChecked: string;
  responseTime: { date: string; value: number }[];
};

const mockMonitor: Monitor = {
  id: "1",
  name: "tcetmumbai.in",
  url: "https://tcetmumbai.in",
  status: "up",
  uptime: "99.98%",
  lastChecked: "32 seconds ago",
  responseTime: [
    { date: "2023-01-01", value: 300 },
    { date: "2023-01-02", value: 280 },
    { date: "2023-01-03", value: 290 },
    { date: "2023-01-04", value: 300 },
    { date: "2023-01-05", value: 310 },
    { date: "2023-01-06", value: 290 },
    { date: "2023-01-07", value: 285 },
    { date: "2023-01-08", value: 295 },
    { date: "2023-01-09", value: 300 },
    { date: "2023-01-10", value: 305 },
  ],
};

const ITEMS_TO_DISPLAY = 2;

export default function MonitorPage() {
  const params = useParams();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    // In a real application, you would fetch the monitor data from an API
    setMonitor(mockMonitor);
  }, [params.id]);

  if (!monitor) {
    return <div>Loading...</div>;
  }

  const statusColor = {
    up: "bg-green-500",
    down: "bg-red-500",
    degraded: "bg-yellow-500",
  };

  const breadcrumbItems = [
    { label: "websites", href: "/" },
    { label: monitor.name },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={breadcrumbItems[0].href}>
              {breadcrumbItems[0].label}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {breadcrumbItems.length > ITEMS_TO_DISPLAY ? (
            <>
              <BreadcrumbItem>
                {isDesktop ? (
                  <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger
                      className="flex items-center gap-1"
                      aria-label="Toggle menu"
                    >
                      <BreadcrumbEllipsis className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {breadcrumbItems.slice(1, -2).map((item, index) => (
                        <DropdownMenuItem key={index}>
                          <Link href={item.href ? item.href : "#"}>
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerTrigger aria-label="Toggle Menu">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader className="text-left">
                        <DrawerTitle>Navigate to</DrawerTitle>
                        <DrawerDescription>
                          Select a page to navigate to.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="grid gap-1 px-4">
                        {breadcrumbItems.slice(1, -2).map((item, index) => (
                          <Link
                            key={index}
                            href={item.href ? item.href : "#"}
                            className="py-1 text-sm"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <DrawerFooter className="pt-4">
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          {breadcrumbItems.slice(-ITEMS_TO_DISPLAY + 1).map((item, index) => (
            <BreadcrumbItem key={index}>
              {item.href ? (
                <>
                  <BreadcrumbLink
                    asChild
                    className="max-w-20 truncate md:max-w-none"
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 ml-1">
          <h1 className="text-2xl font-bold">{monitor.name}</h1>
          <StatusIndicator isActive={true} className="mt-1" />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="border border-white">
            <SendHorizontal className="mr-2 h-4 w-4" />
            Test
          </Button>
          <Button variant="outline" size="sm" className="border border-white">
            <PauseCircle className="mr-2 h-4 w-4" />
            Pause
          </Button>
          <Button variant="outline" size="sm" className="border border-white">
            <Settings className="mr-2 h-4 w-4" />
            Config
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9m 20s</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last checked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitor.lastChecked}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <AreaChartComponent />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-medium">Time period</th>
                <th className="text-left font-medium">Availability</th>
                <th className="text-left font-medium">Downtime</th>
                <th className="text-left font-medium">Incidents</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Today</td>
                <td>100.0000%</td>
                <td>none</td>
                <td>0</td>
              </tr>
              <tr>
                <td>Last 7 days</td>
                <td>100.0000%</td>
                <td>none</td>
                <td>0</td>
              </tr>
              <tr>
                <td>Last 30 days</td>
                <td>100.0000%</td>
                <td>none</td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
