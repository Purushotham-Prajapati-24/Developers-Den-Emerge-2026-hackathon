import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

let globalSocket: Socket | null = null;
const listeners = new Map<string, Set<() => void>>();

export const getGlobalSocket = () => {
  if (globalSocket) return globalSocket;
  
  const token = useAuthStore.getState().accessToken;
  if (!token) return null;

  const serverUrl = (import.meta.env.VITE_WS_SERVER_URL || 'http://localhost:8080') as string;
  
  globalSocket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  globalSocket.on('connect', () => {
    console.log(`[REALTIME] Connected to global socket: ${globalSocket?.id}`);
  });

  // Attach generic event handlers that trigger registered listeners
  const events = ['notification-received', 'project-list-updated', 'collaborator-list-updated'];
  events.forEach(event => {
    globalSocket?.on(event, () => {
      console.log(`[REALTIME] Event received: ${event}`);
      listeners.get(event)?.forEach(cb => cb());
    });
  });

  return globalSocket;
};

export const useRealTime = (event: string, callback: () => void) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const socket = getGlobalSocket();
    if (!socket) return;

    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    
    const trigger = () => callbackRef.current();
    listeners.get(event)?.add(trigger);

    return () => {
      listeners.get(event)?.delete(trigger);
    };
  }, [event]);
};
