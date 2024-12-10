"use client";

import AddWebsiteDialog from "@/components/AddWebsiteDialog";
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
import { MoreVertical, PlusCircle, StopCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

export default function Dashboard() {
  const { websites, removeWebsite, stopMonitoring } = useStore();
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

  const handleStopMonitoring = useCallback(
    (id: string) => {
      stopMonitoring(id);
      const website = websites.find((w) => w.id === id);
      if (website) {
        const message = {
          action: "stop",
          website: {
            userId: 1,
            requestId: 1,
            projectId: id,
            url: website.url,
            interval: "THREE",
          },
        };
        sendMessage(JSON.stringify(message));
      }
    },
    [websites, stopMonitoring, sendMessage]
  );

  const handleRemoveWebsite = useCallback(
    (id: string) => {
      handleStopMonitoring(id);
      removeWebsite(id);
    },
    [handleStopMonitoring, removeWebsite]
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {websites.map((website) => (
                <TableRow key={website.id}>
                  <TableCell>
                    <StatusIndicator isActive={website.isActive} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/website/${website.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {website.url}
                    </Link>
                  </TableCell>
                  <TableCell>{website.responseTime}ms</TableCell>
                  <TableCell>
                    <span
                      className={
                        website.statusCode >= 200 && website.statusCode < 300
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {website.statusCode}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStopMonitoring(website.id)}
                        >
                          <StopCircle className="mr-2 h-4 w-4" />
                          <span>Stop Monitoring</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveWebsite(website.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Remove Website</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
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
