import { useEffect, useRef, useCallback, useState } from 'react';
import { getAccessToken } from '@/lib/api-client';

// Get WebSocket URL based on API base URL
const getWebSocketUrl = () => {
  const envApiBase = import.meta.env.VITE_API_BASE_URL;
  const isLocalEnvBase = !!envApiBase && /localhost|127\.0\.0\.1/.test(envApiBase);
  const apiBaseUrl = envApiBase && !isLocalEnvBase
    ? envApiBase
    : `http://${window.location.hostname}:8000`;
  
  // Convert http(s) to ws(s)
  return apiBaseUrl.replace(/^http/, 'ws');
};

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket(
  channel: string,
  onMessage: (message: WebSocketMessage) => void,
  onError?: (error: Event) => void,
  onOpen?: () => void,
  onClose?: () => void
) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Memoize callbacks to prevent unnecessary re-renders
  const memoizedOnMessage = useCallback(onMessage, [onMessage]);
  const memoizedOnError = useCallback(onError || (() => {}), [onError]);
  const memoizedOnOpen = useCallback(onOpen || (() => {}), [onOpen]);
  const memoizedOnClose = useCallback(onClose || (() => {}), [onClose]);

  const connect = useCallback(() => {
    // Don't connect if channel is not specified
    if (!channel) {
      console.debug('WebSocket: No channel specified, skipping connection');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.warn('No access token available for WebSocket');
      return;
    }

    const wsBaseUrl = getWebSocketUrl();
    const wsUrl = `${wsBaseUrl}/ws/${channel}?token=${token}`;

    console.log(`[WS-${channel}] Connecting to WebSocket: ${wsUrl.replace(token, 'TOKEN')}`);

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log(`[WS-${channel}] Connected`);
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Send immediate ping to keep connection alive
        if (ws.current?.readyState === WebSocket.OPEN) {
          console.log(`[WS-${channel}] Sending initial ping`);
          ws.current.send(JSON.stringify({ type: 'ping' }));
        }
        
        // Start sending ping messages every 30 seconds to keep connection alive
        pingInterval.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            console.log(`[WS-${channel}] Sending periodic ping`);
            ws.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
        
        memoizedOnOpen();
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`[WS-${channel}] Received message:`, message.type);
          memoizedOnMessage(message);
        } catch (error) {
          console.error('[WS] Failed to parse message:', error);
        }
      };

      ws.current.onerror = (event) => {
        console.error(`[WS-${channel}] Error:`, event);
        setIsConnected(false);
        memoizedOnError(event);
      };

      ws.current.onclose = () => {
        console.log(`[WS-${channel}] Closed`);
        setIsConnected(false);
        
        // Clear ping interval
        if (pingInterval.current) {
          clearInterval(pingInterval.current);
          pingInterval.current = null;
        }
        
        memoizedOnClose();
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`[WS-${channel}] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.log(`[WS-${channel}] Max reconnection attempts reached`);
        }
      };
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error);
      setIsConnected(false);
    }
  }, [channel, memoizedOnMessage, memoizedOnError, memoizedOnOpen, memoizedOnClose]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((message: object) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn(`WebSocket not ready (state: ${ws.current?.readyState})`);
    }
  }, []);

  return { send, isConnected, ws: ws.current };
}
