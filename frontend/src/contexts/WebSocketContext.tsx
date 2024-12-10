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
  const { websites, updateWebsite, addDowntime, updateDowntime } = useStore();
  const websitesRef = useRef(websites);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    reconnectAttempts: Infinity,
    reconnectInterval: 3000,
    shouldReconnect: () => true,
    onOpen: () => {
      console.log("WebSocket connection established");
      websitesRef.current.forEach((website) => {
        const message = {
          action: "start",
          website: {
            userId: 1,
            projectId: website.id,
            url: website.url,
            interval: "THREE",
          },
        };
        sendMessage(JSON.stringify(message));
      });
    },
  });

  useEffect(() => {
    websitesRef.current = websites;
  }, [websites]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        const isActive = data.statusCode >= 200 && data.statusCode < 300;
        updateWebsite(data.projectId, {
          responseTime: data.responseTime,
          statusCode: data.statusCode,
          isActive: isActive,
        });

        const website = websitesRef.current.find(
          (w) => w.id === data.projectId
        );
        if (website) {
          if (!isActive) {
            if (website.isActive) {
              // Website just went down
              addDowntime(data.projectId, new Date().toISOString());
            }
            showLimitedToast(website.url, data.statusCode);
          } else if (!website.isActive) {
            // Website just came back up
            updateDowntime(data.projectId, new Date().toISOString());
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, updateWebsite, addDowntime, updateDowntime]);

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
