"use client";

import { LogDisplay } from "@/components/LogDisplay";
import { ResponseTimeChart } from "@/components/ResponseTimeChart";
import { StatsGrid } from "@/components/StatsGrid";
import { StatusTimeline } from "@/components/StatusTimeline";
import { Button } from "@/components/ui/button";
import {
  useWebSocketContext,
  useWebsiteLogs,
} from "@/contexts/WebSocketContext";
import { useStore } from "@/store/useStore";
import { ArrowLeft, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

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

export default function WebsiteDetails() {
  const { id } = useParams();
  const { websites, updateWebsiteCheck } = useStore();
  const { sendMessage } = useWebSocketContext();
  const logs = useWebsiteLogs(id as string);

  const website = websites.find((w) => w.id === id);

  useEffect(() => {
    if (logs.length > 0) {
      logs.forEach((log) => {
        updateWebsiteCheck(id as string, {
          timestamp: log.timestamp,
          responseTime: log.responseTime,
          statusCode: log.statusCode,
        });
      });
    }
  }, [logs, id, updateWebsiteCheck]);

  const handlePauseWebsite = () => {
    if (website) {
      const message = {
        action: "pause",
        website: {
          userId: 1,
          projectId: website.id,
          url: website.url,
          interval: website.interval,
        },
      };
      sendMessage(JSON.stringify(message));
    }
  };

  const handleResumeWebsite = () => {
    if (website) {
      const message = {
        action: "resume",
        website: {
          url: website.url,
        },
      };
      sendMessage(JSON.stringify(message));
    }
  };

  if (!website) {
    return <div>Website not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{website.url}</h1>
        </div>
        {website.isActive ? (
          <Button
            variant="outline"
            onClick={handlePauseWebsite}
            title="Pause Monitoring"
          >
            <Pause className="mr-2 h-4 w-4" /> Pause Monitoring
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleResumeWebsite}
            title="Resume Monitoring"
          >
            <Play className="mr-2 h-4 w-4" /> Resume Monitoring
          </Button>
        )}
      </div>

      <StatusTimeline checks={website.checks} />

      <StatsGrid checks={website.checks} />

      <ResponseTimeChart checks={website.checks} />

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Logs</h2>
        <p>
          Check interval: Every {intervalToNumber(website.interval)} second(s)
        </p>
        <LogDisplay logs={logs} />
      </div>
    </div>
  );
}
