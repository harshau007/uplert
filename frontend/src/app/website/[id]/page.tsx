"use client";

import { LogDisplay } from "@/components/LogDisplay";
import { ResponseTimeChart } from "@/components/ResponseTimeChart";
import { StatsGrid } from "@/components/StatsGrid";
import { StatusTimeline } from "@/components/StatusTimeline";
import { Button } from "@/components/ui/button";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { useStore } from "@/store/useStore";
import { ArrowLeft, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function WebsiteDetails() {
  const { id } = useParams();
  const { websites } = useStore();
  const { sendMessage } = useWebSocketContext();

  const website = websites.find((w) => w.id === id);

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
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{website.url}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handlePauseWebsite}
            title="Pause Monitoring"
          >
            <Pause className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleResumeWebsite}
            title="Resume Monitoring"
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <StatusTimeline checks={website.checks} interval={website.interval} />

      <StatsGrid checks={website.checks} />

      <ResponseTimeChart checks={website.checks} />

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Logs</h2>
        <LogDisplay projectId={website.id} />
      </div>
    </div>
  );
}
