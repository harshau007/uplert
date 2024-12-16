"use client";

import { useStore } from "@/store/useStore";
import { showLimitedToast } from "@/utils/toast";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

type Log = {
  website: string;
  timestamp: string;
  responseTime: number;
  statusCode: number;
};

type WebSocketContextType = {
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent<any> | null;
  readyState: ReadyState;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const STORAGE_KEY = "websiteMonitorSessionId";
const ACTIVE_WEBSITES_KEY = "activeWebsites";

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const {
    websites,
    updateWebsiteCheck,
    pauseWebsite,
    resumeWebsite,
    syncRunningWebsites,
    pauseAllWebsites,
  } = useStore();
  const websitesRef = useRef(websites);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (sessionId) {
      setSocketUrl(
        `ws://${process.env.API_BASE_ENDPOINT}/ws?sessionId=${sessionId}`
      );
    } else {
      setSocketUrl(`ws://${process.env.API_BASE_ENDPOINT}/ws`);
    }
  }, [sessionId]);

  const {
    sendMessage: rawSendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl, {
    reconnectAttempts: Infinity,
    reconnectInterval: 3000,
    shouldReconnect: () => true,
    onOpen: () => {
      console.log("WebSocket connection established");
      if (!isInitialMount.current) {
        const activeWebsites = JSON.parse(
          localStorage.getItem(ACTIVE_WEBSITES_KEY) || "[]"
        );
        websitesRef.current.forEach((website) => {
          if (activeWebsites.includes(website.id)) {
            resumeWebsite(website.id);
            sendMessage(
              JSON.stringify({
                action: "resume",
                website: {
                  userId: 1,
                  projectId: website.id,
                  url: website.url,
                  interval: website.interval,
                },
              })
            );
          }
        });
        localStorage.removeItem(ACTIVE_WEBSITES_KEY);
      }
      isInitialMount.current = false;
    },
  });

  const sendMessage = (message: string) => {
    if (sessionId) {
      const messageWithSession = JSON.parse(message);
      messageWithSession.sessionId = sessionId;
      rawSendMessage(JSON.stringify(messageWithSession));
    } else {
      console.error("No session ID available");
    }
  };

  useEffect(() => {
    websitesRef.current = websites;
  }, [websites]);

  useEffect(() => {
    pauseAllWebsites();
    websitesRef.current.forEach((website) => {
      if (website.isActive) {
        sendMessage(
          JSON.stringify({
            action: "pause",
            website: {
              userId: 1,
              projectId: website.id,
              url: website.url,
              interval: website.interval,
            },
          })
        );
      }
    });
  }, []);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        console.log(data);
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem(STORAGE_KEY, data.sessionId);
        } else if (Array.isArray(data)) {
          // This is the initial message with running websites
          syncRunningWebsites(data);
        } else {
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
            // pauseWebsite(data.projectId);
            console.log(data);
          } else if (data.action === "resume") {
            resumeWebsite(data.projectId);
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [
    lastMessage,
    updateWebsiteCheck,
    pauseWebsite,
    resumeWebsite,
    syncRunningWebsites,
    sessionId,
  ]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const activeWebsites = websitesRef.current
        .filter((website) => website.isActive)
        .map((website) => website.id);
      localStorage.setItem(ACTIVE_WEBSITES_KEY, JSON.stringify(activeWebsites));

      websitesRef.current.forEach((website) => {
        if (website.isActive) {
          sendMessage(
            JSON.stringify({
              action: "pause",
              website: {
                userId: 1,
                projectId: website.id,
                url: website.url,
                interval: website.interval,
              },
            })
          );
        }
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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

export const useWebsiteLogs = (projectId: string) => {
  const [logs, setLogs] = useState<Log[]>([]);
  useEffect(() => {
    const logSocket = new WebSocket(
      `ws://${process.env.API_BASE_ENDPOINT}/ws/${projectId}/log`
    );

    logSocket.onmessage = (event) => {
      const log = JSON.parse(event.data);
      setLogs((prevLogs) => [...prevLogs, log]);
    };
  }, [projectId]);

  return logs;
};
