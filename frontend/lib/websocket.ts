import { useEffect, useState } from "react";

export function useWebSocket(url: string) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setData(message);
    };

    ws.onerror = (event) => {
      setError(new Error("WebSocket error"));
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { data, error };
}
