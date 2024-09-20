"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Incident = {
  id: string;
  title: string;
  status: "ongoing" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  affectedMonitors: string[];
};

const mockIncidents: Incident[] = [
  {
    id: "1",
    title: "API Outage",
    status: "ongoing",
    createdAt: "2023-09-20T10:00:00Z",
    affectedMonitors: ["API Endpoint"],
  },
  {
    id: "2",
    title: "Database Slowdown",
    status: "resolved",
    createdAt: "2023-09-19T14:30:00Z",
    resolvedAt: "2023-09-19T16:45:00Z",
    affectedMonitors: ["User Dashboard", "API Endpoint"],
  },
];

export function IncidentsList() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center space-x-4">
                {incident.status === "ongoing" ? (
                  <AlertCircle className="text-red-500" />
                ) : (
                  <CheckCircle className="text-green-500" />
                )}
                <div>
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="font-medium hover:underline"
                  >
                    {incident.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Affected: {incident.affectedMonitors.join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {incident.status === "ongoing" ? "Started" : "Resolved"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {incident.status === "ongoing"
                      ? new Date(incident.createdAt).toLocaleString()
                      : new Date(incident.resolvedAt!).toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {incident.status === "ongoing" ? "Resolve" : "View Details"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
