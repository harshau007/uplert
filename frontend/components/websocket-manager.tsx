"use client";

import React, { ReactElement, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const WS_URL = "ws://localhost:3001/ws";
const WS_GET_URL = "ws://localhost:3001/ws/get";

export interface MonitoringData {
  url: string;
  status: "up" | "down" | "degraded";
  response_time: string;
}

export interface MonitoringDataMap {
  [url: string]: MonitoringData[];
}

interface WebSocketManagerProps {
  children: ReactElement | ReactElement[];
}

export interface WebSocketContextProps {
  monitoringData: MonitoringDataMap;
  sendMonitorRequest: (url: string, interval: string) => void;
}

export function useWebSocketManager(): WebSocketContextProps {
  const [monitoringData, setMonitoringData] = useState<MonitoringDataMap>({});
  const wsRef = useRef<WebSocket | null>(null);
  const wsGetRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Connect to the main WebSocket for receiving data
      wsRef.current = new WebSocket(WS_URL, "echo-protocol");

      wsRef.current.onmessage = (event: MessageEvent) => {
        const data: MonitoringData = JSON.parse(event.data);
        setMonitoringData((prevData) => {
          const newData = { ...prevData };
          if (!newData[data.url]) {
            newData[data.url] = [];
          }
          newData[data.url] = [data, ...newData[data.url].slice(0, 9)];
          return newData;
        });

        // Check for anomalies and show toast
        if (data.status === "down" || data.status === "degraded") {
          toast.error(`${data.url} is ${data.status}!`, {
            description: `Response time: ${data.response_time}`,
          });
        }
      };

      // Connect to the WebSocket for sending data
      wsGetRef.current = new WebSocket(WS_GET_URL);

      return () => {
        if (wsRef.current) wsRef.current.close();
        if (wsGetRef.current) wsGetRef.current.close();
      };
    }
  }, []);

  const sendMonitorRequest = (url: string, interval: string) => {
    if (wsGetRef.current && wsGetRef.current.readyState === WebSocket.OPEN) {
      wsGetRef.current.send(JSON.stringify({ url, interval }));
    } else {
      console.error("WebSocket is not open");
    }
  };

  return { monitoringData, sendMonitorRequest };
}

export function WebSocketManager({ children }: WebSocketManagerProps) {
  const websocketProps = useWebSocketManager();

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, websocketProps);
        }
        return child;
      })}
    </>
  );
}
