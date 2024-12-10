import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";

type Alert = {
  id: string;
  type: "up" | "down";
  timestamp: string;
  message: string;
};

const dummyAlerts: Alert[] = [
  {
    id: "1",
    type: "down",
    timestamp: "2023-05-30 15:23",
    message: "Website is down",
  },
  {
    id: "2",
    type: "up",
    timestamp: "2023-05-30 15:45",
    message: "Website is back up",
  },
  {
    id: "3",
    type: "down",
    timestamp: "2023-05-29 10:12",
    message: "High response time detected",
  },
];

export default function RecentAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {dummyAlerts.map((alert) => (
            <li key={alert.id} className="flex items-start space-x-2">
              {alert.type === "down" ? (
                <AlertTriangle className="text-red-500" />
              ) : (
                <CheckCircle className="text-green-500" />
              )}
              <div>
                <p className="font-semibold">{alert.message}</p>
                <p className="text-sm text-gray-500">{alert.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
