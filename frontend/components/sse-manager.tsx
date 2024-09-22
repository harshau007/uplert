"use client";

import React, { ReactElement, useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";

const SSE_URL = "http://localhost:3001/sse";
const SSE_GET_URL = "http://localhost:3001/get";

export interface MonitoringData {
  url: string;
  status: "up" | "down" | "degraded" | "pending" | "unknown";
  response_time: string;
  interval: string;
}

export type   MonitoringDataMap = {
  [url: string]: MonitoringData;
}

interface SSEManagerProps {
  children: ReactElement | ReactElement[];
}

export interface SSEContextProps {
  monitoringData: MonitoringDataMap;
  sendMonitorRequest: (url: string, interval: string) => void;
  deleteMonitor: (url: string) => void;
  isConnected: boolean;
}

export function useSSEManager(): SSEContextProps {
  const [monitoringData, setMonitoringData] = useLocalStorage<MonitoringDataMap>("monitoringData", {});
  const [isConnected, setIsConnected] = useState(true);
  const lastUpdateTime = useRef<{ [url: string]: number }>({});

  const updateMonitoringData = useCallback((data: MonitoringData) => {
    setMonitoringData((prevData) => {
      const newData = { ...prevData, [data.url]: data };
      lastUpdateTime.current[data.url] = Date.now();
      return newData;
    });
  }, [setMonitoringData]);

  const checkDataFreshness = useCallback(() => {
    const now = Date.now();
    setMonitoringData((prevData) => {
      const newData = { ...prevData };
      Object.keys(newData).forEach((url) => {
        const lastUpdate = lastUpdateTime.current[url] || 0;
        const interval = parseInt(newData[url].interval || "60", 10) * 1000;
        if (now - lastUpdate > interval * 1.5) {
          newData[url] = { ...newData[url], status: "unknown" };
        }
      });
      return newData;
    });
  }, [setMonitoringData]);

  const connectSSE = useCallback(() => {
    if (typeof window !== "undefined") {
      const eventSource = new EventSource(SSE_URL);

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log("SSE connection opened");
      };

      eventSource.onmessage = (event: MessageEvent) => {
        const data: MonitoringData = JSON.parse(event.data);
        updateMonitoringData(data);

        if (data.status === "down" || data.status === "degraded") {
          toast.error(`${data.url} is ${data.status}!`, {
            description: `Response time: ${data.response_time}`,
          });
        }
      };

      eventSource.onerror = () => {
        console.log("SSE error. Reconnecting...");
        eventSource.close();
        setIsConnected(false);
        connectSSE();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [updateMonitoringData]);

  useEffect(() => {
    const cleanup = connectSSE();
    const intervalId = setInterval(checkDataFreshness, 1000);

    return () => {
      cleanup && cleanup();
      clearInterval(intervalId);
    };
  }, [connectSSE, checkDataFreshness]);

  const sendMonitorRequest = useCallback((url: string, interval: string) => {
    fetch(SSE_GET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, interval }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to send monitor request');
        }
        return response.json();
      })
      .then(data => {
        console.log('Monitor request sent successfully:', data);
        updateMonitoringData({ url, status: "pending", response_time: "0", interval });
      })
      .catch(error => {
        console.error("Error sending monitor request:", error);
        toast.error("Failed to add monitor. Please try again.");
      });
  }, [updateMonitoringData]);

  const deleteMonitor = useCallback((url: string) => {
    fetch(`${SSE_GET_URL}/${encodeURIComponent(url)}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete monitor');
        }
        setMonitoringData((prevData) => {
          const newData = { ...prevData };
          delete newData[url];
          delete lastUpdateTime.current[url];
          return newData;
        });
        toast.success(`Monitor for ${url} deleted successfully`);
      })
      .catch(error => {
        console.error("Error deleting monitor:", error);
        toast.error(`Failed to delete monitor for ${url}`);
      });
  }, [setMonitoringData]);

  return { monitoringData, sendMonitorRequest, deleteMonitor, isConnected };
}

export const SSEContext = React.createContext<SSEContextProps | undefined>(undefined);

export function SSEManager({ children }: SSEManagerProps) {
  const sseProps = useSSEManager();

  return (
    <SSEContext.Provider value={sseProps}>
      {children}
    </SSEContext.Provider>
  );
}

export function useSSE() {
  const context = React.useContext(SSEContext);
  if (context === undefined) {
    throw new Error("useSSE must be used within a SSEManager");
  }
  return context;
}