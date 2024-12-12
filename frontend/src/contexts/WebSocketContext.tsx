"use client";

import { useStore } from "@/store/useStore";
import { showLimitedToast } from "@/utils/toast";
import React, { createContext, useContext, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

type WebSocketContextType = {
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent<any> | null;
  readyState: ReadyState;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socketUrl] = React.useState("ws://127.0.0.1:8080/ws");
  const { websites, updateWebsiteCheck, pauseWebsite, resumeWebsite } =
    useStore();
  const websitesRef = useRef(websites);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    reconnectAttempts: Infinity,
    reconnectInterval: 3000,
    shouldReconnect: () => true,
    onOpen: () => {
      console.log("WebSocket connection established");
      websitesRef.current.forEach((website) => {
        if (website.isActive) {
          const message = {
            action: "start",
            website: {
              userId: 1,
              projectId: website.id,
              url: website.url,
              interval: website.interval,
            },
          };
          sendMessage(JSON.stringify(message));
        }
      });
    },
  });

  useEffect(() => {
    websitesRef.current = websites;
  }, [websites]);

  useEffect(() => {
    if (lastMessage) {
      try {
        console.log("Received WebSocket message:", lastMessage.data);
        const data = JSON.parse(lastMessage.data);
        console.log("Parsed WebSocket message:", data);

        const check = {
          timestamp: new Date().toISOString(),
          responseTime: data.responseTime,
          statusCode: data.statusCode,
        };
        updateWebsiteCheck(data.projectId, check);

        if (data.statusCode !== 200) {
          const website = websitesRef.current.find(
            (w) => w.id === data.projectId
          );
          if (website) {
            showLimitedToast(website.url, data.statusCode);
          }
        }
        if (data.action === "pause") {
          pauseWebsite(data.projectId);
        } else if (data.action === "resume") {
          resumeWebsite(data.projectId);
        } else {
          console.warn("Unknown action received:", data.action);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        console.error("Raw message:", lastMessage.data);
      }
    }
  }, [lastMessage, updateWebsiteCheck, pauseWebsite, resumeWebsite]);

  return (
    <WebSocketContext.Provider value={{ sendMessage, lastMessage, readyState }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};
