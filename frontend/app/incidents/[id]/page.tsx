"use client";

import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Incident = {
  id: string;
  title: string;
  status: "ongoing" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  affectedMonitor: string;
  timeline: TimelineEvent[];
};

type TimelineEvent = {
  id: string;
  type: "comment" | "status" | "action";
  content: string;
  timestamp: string;
  user?: string;
};

const mockIncident: Incident = {
  id: "1",
  title: "Sample incident",
  status: "ongoing",
  createdAt: "2023-09-20T07:15:00Z",
  affectedMonitor: "google.com",
  timeline: [
    {
      id: "1",
      type: "status",
      content: "Incident started",
      timestamp: "2023-09-20T07:15:00Z",
    },
    {
      id: "2",
      type: "action",
      content: "Escalated to on-call team",
      timestamp: "2023-09-20T07:20:00Z",
    },
    {
      id: "3",
      type: "comment",
      content: "Investigating the root cause",
      timestamp: "2023-09-20T07:25:00Z",
      user: "John Doe",
    },
  ],
};

const breadcrumbItems = [
  { label: "Incidents", href: "/incidents" },
  { label: mockIncident.title },
];

const ITEMS_TO_DISPLAY = 2;

export default function IncidentPage() {
  const params = useParams();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    // In a real application, you would fetch the incident data from an API
    setIncident(mockIncident);
  }, [params.id]);

  if (!incident) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
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
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">{incident.affectedMonitor}</h1>
          <Badge
            variant={incident.status === "ongoing" ? "destructive" : "default"}
          >
            {incident.status === "ongoing" ? "Ongoing" : "Resolved"}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Escalate</Button>
          <Button variant="default">Acknowledge</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Title:</span> {incident.title}
            </div>
            <div>
              <span className="font-semibold">Started at:</span>{" "}
              {new Date(incident.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Status:</span> {incident.status}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incident.timeline.map((event) => (
              <div key={event.id} className="flex items-start space-x-4">
                {event.type === "status" && (
                  <AlertCircle className="text-yellow-500" />
                )}
                {event.type === "action" && (
                  <CheckCircle className="text-blue-500" />
                )}
                {event.type === "comment" && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {event.user?.[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium">{event.content}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Type your comment here." />
          <Button className="mt-2">Post Comment</Button>
        </CardContent>
      </Card>
    </div>
  );
}
