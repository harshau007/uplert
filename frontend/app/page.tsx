import { CreateMonitorDialog } from "@/components/create-monitor-dialog";
import { MonitorsList } from "@/components/monitors-list";
import { MonitorsListSkeleton } from "@/components/monitors-list-skeleton";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";

export default function MonitorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Websites</h1>
        <div className="flex space-x-4">
          <Input className="w-64" placeholder="Search monitors" />
          <CreateMonitorDialog />
        </div>
      </div>
      <Suspense fallback={<MonitorsListSkeleton />}>
        <MonitorsList />
      </Suspense>
    </div>
  );
}
