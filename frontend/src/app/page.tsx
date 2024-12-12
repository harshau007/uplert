"use client";

import AddWebsiteDialog from "@/components/AddWebsiteDialog";
import StatusIndicator from "@/components/StatusIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Pause, Play, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

export default function Dashboard() {
  const { websites, removeWebsite } = useStore();
  const { sendMessage } = useWebSocketContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddWebsite = useCallback(
    (url: string, interval: string) => {
      const id = useStore.getState().addWebsite(url, interval);
      const message = {
        action: "start",
        website: {
          userId: 1,
          projectId: id,
          url,
          interval,
        },
      };
      sendMessage(JSON.stringify(message));
      setIsAddDialogOpen(false);
    },
    [sendMessage]
  );

  const handlePauseWebsite = useCallback(
    (id: string, url: string, interval: string) => {
      const message = {
        action: "pause",
        website: {
          userId: 1,
          projectId: id,
          url: url,
          interval: interval,
        },
      };
      sendMessage(JSON.stringify(message));
    },
    [sendMessage]
  );

  const handleResumeWebsite = useCallback(
    (url: string) => {
      const message = {
        action: "resume",
        website: {
          url: url,
        },
      };
      sendMessage(JSON.stringify(message));
    },
    [sendMessage]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Website
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monitored Websites</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Status Code</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites.map((website) => {
                const latestCheck = website.checks[website.checks.length - 1];
                return (
                  <TableRow key={website.id}>
                    <TableCell>
                      <StatusIndicator
                        isActive={
                          website.isActive && latestCheck?.statusCode === 200
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/website/${website.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {website.url}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {latestCheck?.responseTime ?? "N/A"}ms
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          latestCheck?.statusCode >= 200 &&
                          latestCheck?.statusCode < 300
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {latestCheck?.statusCode ?? "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>{website.interval}</TableCell>
                    <TableCell>
                      {website.isActive ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handlePauseWebsite(
                              website.id,
                              website.url,
                              website.interval
                            )
                          }
                          title="Pause Monitoring"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResumeWebsite(website.url)}
                          title="Resume Monitoring"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddWebsiteDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddWebsite}
      />
    </div>
  );
}
