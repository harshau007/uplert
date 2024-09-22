"use client";

import { CreateMonitorDialog } from "@/components/create-monitor-dialog";
import { MonitorsList } from "@/components/monitors-list";
import { MonitorsListSkeleton } from "@/components/monitors-list-skeleton";
import { Input } from "@/components/ui/input";
import {
  MonitoringDataMap,
  SSEManager,
  SSEContextProps,
  useSSEManager
} from "@/components/sse-manager";
import { Suspense, useState, useEffect } from "react";

function SSEMonitorsPageContent({
  monitoringData,
  sendMonitorRequest,
  deleteMonitor,
  isConnected,
}: SSEContextProps) {
  const hasMonitors = Object.keys(monitoringData).length > 0;
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (!isConnected) {
      timeoutId = setTimeout(() => setShowBanner(true), 5000);
    } else {
      setShowBanner(false);
    }
    return () => clearTimeout(timeoutId);
  }, [isConnected]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Websites</h1>
        <div className="flex space-x-4">
          <Input className="w-64" placeholder="Search monitors" />
          <CreateMonitorDialog sendMonitorRequest={sendMonitorRequest} />
        </div>
      </div>
      {showBanner && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Warning</p>
          <p>Connection to the server lost. Displaying cached data. Reconnecting...</p>
        </div>
      )}
      <Suspense fallback={<MonitorsListSkeleton />}>
        {hasMonitors ? (
          <MonitorsList 
            monitoringData={monitoringData}   
            hasMonitors={hasMonitors}
            onDeleteMonitor={deleteMonitor}
          />
        ) : (
          <div className="text-center text-muted-foreground pointer-events-none select-none opacity-50">
            No Websites found. Is your Backend & Monitoring Service running?
          </div>
        )}
      </Suspense>
    </div>
  );
}

export default function SSEMonitorsContent() {
  const sseProps = useSSEManager();
  return <SSEMonitorsPageContent {...sseProps} />;
}