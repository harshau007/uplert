"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { ReadyState } from "react-use-websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Pause, Play, AlertTriangle } from "lucide-react";
import AddWebsiteDialog from "@/components/AddWebsiteDialog";
import StatusIndicator from "@/components/StatusIndicator";

const intervalToNumber = (interval: string) => {
  switch (interval) {
    case "ONE":
      return 1;
    case "THREE":
      return 3;
    case "FIVE":
      return 5;
    default:
      return parseInt(interval) || 0;
  }
};

export default function Dashboard() {
  const { websites } = useStore();
  const { sendMessage, readyState } = useWebSocketContext();
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
    (id: string, url: string, interval: string) => {
      const message = {
        action: "resume",
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

  const renderConnectionStatus = () => {
    switch (readyState) {
      case ReadyState.CONNECTING:
        return <div className="text-yellow-500">Connecting to server...</div>;
      case ReadyState.OPEN:
        return <div className="text-green-500">Connected</div>;
      case ReadyState.CLOSING:
        return <div className="text-yellow-500">Closing connection...</div>;
      case ReadyState.CLOSED:
        return (
          <div className="text-red-500">
            Disconnected. Attempting to reconnect...
          </div>
        );
      default:
        return <div className="text-red-500">Unknown connection state</div>;
    }
  };

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
          <CardTitle className="flex justify-between items-center">
            <span>Monitored Websites</span>
            {renderConnectionStatus()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {readyState === ReadyState.OPEN ? (
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
                  const latestCheck = website.checks[0];
                  return (
                    <TableRow key={website.id}>
                      <TableCell className="p-5">
                        <StatusIndicator
                          isActive={
                            website.isActive && latestCheck?.statusCode === 200
                          }
                          size="lg"
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
                      <TableCell>
                        {intervalToNumber(website.interval)} min
                      </TableCell>
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
                            onClick={() =>
                              handleResumeWebsite(
                                website.id,
                                website.url,
                                website.interval
                              )
                            }
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
          ) : (
            <div className="text-center py-4 flex items-center justify-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Waiting for server connection...
            </div>
          )}
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
