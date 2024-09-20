import { CreateIncidentDialog } from "@/components/create-incident-dialog";
import { IncidentsList } from "@/components/incidents-list";
import { IncidentsListSkeleton } from "@/components/incidents-list-skeleton";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Incidents</h1>
        <div className="flex space-x-4">
          <Input className="w-64" placeholder="Search incidents" />
          <CreateIncidentDialog />
        </div>
      </div>
      <Suspense fallback={<IncidentsListSkeleton />}>
        <IncidentsList />
      </Suspense>
    </div>
  );
}
