import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

function getWsBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `wss://${domain}/ws`;
  if (Platform.OS === 'android') return 'ws://10.0.2.2:8080/ws';
  return 'ws://localhost:8080/ws';
}

export type WsMessage =
  | { type: 'token'; content: string }
  | { type: 'done'; messageId: number; safetyFlagged?: boolean; memoriesUsed?: boolean; breakReminder?: string }
  | { type: 'error'; content: string; limitReached?: boolean };

type WsCallback = {
  onToken: (token: string) => void;
  onDone: (msg: { messageId: number; safetyFlagged?: boolean; memoriesUsed?: boolean; breakReminder?: string }) => void;
  onError: (error: string) => void;
};

export function connectChatWs(
  companionId: string,
  callbacks: WsCallback,
): { send: (msg: { content: string; sessionStartedAt?: string }) => void; close: () => void } {
  let ws: WebSocket | null = null;
  let closed = false;

  const connect = async () => {
    if (closed) return;
    const token = await AsyncStorage.getItem('authToken');
    if (!token) { callbacks.onError('Not authenticated'); return; }

    ws = new WebSocket(`${getWsBaseUrl()}/chat?token=${token}`);

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data as string);
        switch (msg.type) {
          case 'token':
            callbacks.onToken(msg.content);
            break;
          case 'done':
            callbacks.onDone(msg);
            break;
          case 'error':
            callbacks.onError(msg.content);
            break;
        }
      } catch {}
    };

    ws.onerror = () => {
      if (!closed) callbacks.onError('Connection error');
    };

    ws.onclose = () => {
      if (!closed) callbacks.onError('Connection closed');
    };
  };

  connect();

  return {
    send: (msg) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ companionId, ...msg }));
      } else {
        callbacks.onError('Not connected');
      }
    },
    close: () => {
      closed = true;
      ws?.close();
    },
  };
}
