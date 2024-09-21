"use client";

import { CreateMonitorDialog } from "@/components/create-monitor-dialog";
import { MonitorsList } from "@/components/monitors-list";
import { MonitorsListSkeleton } from "@/components/monitors-list-skeleton";
import { Input } from "@/components/ui/input";
import {
  WebSocketContextProps,
  WebSocketManager,
} from "@/components/websocket-manager";
import { Suspense } from "react";

function MonitorsPageContent({
  monitoringData,
  sendMonitorRequest,
}: WebSocketContextProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Websites</h1>
        <div className="flex space-x-4">
          <Input className="w-64" placeholder="Search monitors" />
          <CreateMonitorDialog sendMonitorRequest={sendMonitorRequest} />
        </div>
      </div>
      <Suspense fallback={<MonitorsListSkeleton />}>
        <MonitorsList monitoringData={monitoringData} />
      </Suspense>
    </div>
  );
}

export default function MonitorsContent() {
  return (
    <WebSocketManager>
      <MonitorsPageContent monitoringData={{}} sendMonitorRequest={() => {}} />
    </WebSocketManager>
  );
}
