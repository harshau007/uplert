"use client";

import AddWebsiteDialog from "@/components/AddWebsiteDialog";
import { DeleteWebsiteDialog } from "@/components/ConfirmationDialog";
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
import { AlertTriangle, PlusCircle, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ReadyState } from "react-use-websocket";

const intervalToNumber = (interval: string) => {
  switch (interval) {
    case "TEN":
      return 10;
    case "THIRTY":
      return 30;
    case "SIXTY":
      return 60;
    default:
      return parseInt(interval) || 0;
  }
};

export default function Dashboard() {
  const { websites, addWebsite, updateWebsiteCheck, deleteWebsite } =
    useStore();
  const { sendMessage, lastMessage, readyState } = useWebSocketContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    websiteId: string;
    websiteUrl: string;
    interval: string;
  }>({
    isOpen: false,
    websiteId: "",
    websiteUrl: "",
    interval: "",
  });
  const router = useRouter();

  const handleAddWebsite = useCallback(
    (url: string, interval: string) => {
      const id = addWebsite(url, interval);
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
      router.push(`/website/${id}`);
    },
    [sendMessage, router, addWebsite]
  );

  const handleDeleteWebsite = useCallback(
    (id: string, url: string, interval: string) => {
      setDeleteDialogState({
        isOpen: true,
        websiteId: id,
        websiteUrl: url,
        interval: interval,
      });
    },
    []
  );

  const confirmDeleteWebsite = useCallback(() => {
    const { websiteId, websiteUrl, interval } = deleteDialogState;
    const message = {
      action: "delete",
      website: {
        id: 1,
        projectId: websiteId,
        url: websiteUrl,
        interval: interval,
      },
    };
    sendMessage(JSON.stringify(message));
    deleteWebsite(websiteId);
    setDeleteDialogState((prev) => ({ ...prev, isOpen: false }));
  }, [deleteDialogState, sendMessage, deleteWebsite]);

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        const check = {
          timestamp: new Date().toISOString(),
          responseTime: data.responseTime,
          statusCode: data.statusCode,
        };
        updateWebsiteCheck(data.projectId, check);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, updateWebsiteCheck]);

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
            <>
              {websites.length === 0 ? (
                <div className="text-center py-8 select-none">
                  <p className="text-xl font-semibold">
                    No websites to monitor
                  </p>
                  <p className="text-muted-foreground">
                    Add a website to start monitoring
                  </p>
                </div>
              ) : (
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
                              isActive={latestCheck?.statusCode === 200}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteWebsite(
                                  website.id,
                                  website.url,
                                  website.interval
                                )
                              }
                              title="Delete"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </>
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
      <DeleteWebsiteDialog
        isOpen={deleteDialogState.isOpen}
        onClose={() =>
          setDeleteDialogState((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmDeleteWebsite}
        websiteUrl={deleteDialogState.websiteUrl}
      />
    </div>
  );
}
