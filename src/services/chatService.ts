import { io } from "socket.io-client";
import { getAuthToken, request } from "./apiClient";
import { storage } from "./storage";
import { shouldUseDemoData } from "../config/demoMode";
import type { ApiError, ApiRecord } from "../types/api";
import type { ChatClient, ChatMessage, ChatState } from "../types/chat";

const SOCKET_NAMESPACE = "/chats";
export const WELCOME_MESSAGE_TEXT = "I'm NOVA. How may I help you today?";
const SOCKET_EVENTS = {
  BOT_MESSAGE: "bot_message",
  CONNECT: "connect",
  CONNECT_ERROR: "connect_error",
  DISCONNECT: "disconnect",
  ERROR: "error",
  USER_MESSAGE: "user_message",
};

export function chatStorageKey(userId: string) {
  return `patient_chat_${userId}`;
}

function chatThreadKey(userId: string) {
  return `patient_chat_thread_${userId}`;
}

function welcomeMessage(): ChatMessage {
  return {
    text: WELCOME_MESSAGE_TEXT,
    isUser: false,
    time: formatTime(),
  };
}

function readLocalChatMessages(userId: string) {
  const saved = storage.get<ChatMessage[]>(chatStorageKey(userId), []);
  if (saved.length) return saved;
  return [welcomeMessage()];
}

export function saveChatMessages(userId: string, messages: ChatMessage[]) {
  storage.set(chatStorageKey(userId), messages);
}

function saveChatThreadId(userId: string, chatId: string) {
  storage.set(chatThreadKey(userId), chatId);
}

function removeChatThreadId(userId: string) {
  storage.remove(chatThreadKey(userId));
}

function readChatThreadId(userId: string) {
  return storage.get<string | null>(chatThreadKey(userId), null);
}

function createObjectIdString() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getOrCreateChatThreadId(userId: string) {
  const existingChatId = readChatThreadId(userId);
  if (existingChatId) return existingChatId;

  const chatId = createObjectIdString();
  saveChatThreadId(userId, chatId);
  return chatId;
}

export function formatTime() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function formatMessageTime(value: unknown) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return formatTime();
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function createLocalReply(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return "I hear you. I'm running in local mode while the backend reconnects, but your message is saved and we can keep this check-in going.";
  }

  return "I hear you. I'm running in local mode while the backend reconnects, but your message is saved and we can keep this check-in going.";
}

function normalizeMessages(messages: unknown): ChatMessage[] {
  const list = toArrayPayload(messages);
  if (list.length === 0) {
    return [welcomeMessage()];
  }

  return list.map((message) => ({
    text: String(message.content || message.text || ""),
    isUser: message.sender === "user" || message.isUser === true || message.isSenderUser === true,
    time: message.createdAt ? formatMessageTime(message.createdAt) : String(message.time || formatTime()),
  }));
}

function pickLatestChatId(data: unknown, fallbackChatId: string | null = null) {
  const list = toArrayPayload(data);
  if (list.length === 0) return fallbackChatId;
  if (fallbackChatId && list.some((item) => item._id === fallbackChatId || item.id === fallbackChatId)) {
    return fallbackChatId;
  }
  return String(list[0]?._id || list[0]?.id || fallbackChatId || "");
}

function toArrayPayload(data: unknown): ApiRecord[] {
  if (Array.isArray(data)) return data.filter((item) => item && typeof item === "object" && !Array.isArray(item)) as ApiRecord[];
  if (!data || typeof data !== "object") return [];
  const record = data as ApiRecord;
  if (Array.isArray(record.data)) return record.data.filter((item) => item && typeof item === "object" && !Array.isArray(item)) as ApiRecord[];

  return Object.keys(record)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => record[key])
    .filter((item) => item && typeof item === "object" && !Array.isArray(item)) as ApiRecord[];
}

function socketBaseUrl() {
  const explicitSocketBaseUrl = process.env.NEXT_PUBLIC_SOCKET_BASE_URL?.trim();
  if (explicitSocketBaseUrl) return explicitSocketBaseUrl.replace(/\/$/, "");
  const publicBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (publicBackendUrl) return publicBackendUrl.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const { hostname, protocol, port } = window.location;
    if ((hostname === "localhost" || hostname === "127.0.0.1") && port !== "3000") {
      return `${protocol}//${hostname}:3000`;
    }
  }
  return window.location.origin.replace(/\/$/, "");
}

function normalizeSocketChunk(payload: unknown) {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return "";
  const record = payload as ApiRecord;
  return String(record.text || record.content || record.message || "");
}

function isNoChatsError(error: unknown) {
  const typedError = error as ApiError;
  return typedError.status === 400 && /no chats found/i.test(typedError.message);
}

function isNoMessagesError(error: unknown) {
  const typedError = error as ApiError;
  return typedError.status === 400 && /no messages found/i.test(typedError.message);
}

function shouldRefreshStoredChat(error: unknown) {
  const typedError = error as ApiError;
  return typedError.status === 401 || typedError.status === 404;
}

async function createRemoteChat(userId: string) {
  const created = await request("/chats", {
    auth: true,
    method: "POST",
  });
  const createdRecord = created as ApiRecord;
  const nested = createdRecord.data && typeof createdRecord.data === "object" && !Array.isArray(createdRecord.data)
    ? createdRecord.data as ApiRecord
    : {};
  const chatId = String(createdRecord.chatId || nested.chatId || "");
  if (chatId) {
    saveChatThreadId(userId, chatId);
    return chatId;
  }

  return null;
}

type RemoteChatThread = {
  chatId: string;
  source: "backend" | "stored";
};

async function ensureRemoteChat(userId: string, { skipStored = false } = {}): Promise<RemoteChatThread | null> {
  const existingChatId = skipStored ? null : readChatThreadId(userId);
  if (existingChatId) return { chatId: existingChatId, source: "stored" };

  try {
    const chats = await request("/chats", { auth: true });
    const chatId = pickLatestChatId(chats, existingChatId);
    if (chatId) {
      saveChatThreadId(userId, chatId);
      return { chatId, source: "backend" };
    }
  } catch (error) {
    if (!isNoChatsError(error)) throw error;
  }

  const chatId = await createRemoteChat(userId);
  return chatId ? { chatId, source: "backend" } : null;
}

async function loadRemoteMessages(chatId: string) {
  const remoteMessages = await request(`/chats/${chatId}`, { auth: true });
  return normalizeMessages(remoteMessages);
}

export async function loadChatState(userId: string): Promise<ChatState> {
  const localMessages = readLocalChatMessages(userId);

  if (shouldUseDemoData()) {
    return { chatId: getOrCreateChatThreadId(userId), messages: localMessages, mode: "local" };
  }

  try {
    const thread = await ensureRemoteChat(userId);
    if (!thread) {
      return { chatId: getOrCreateChatThreadId(userId), messages: localMessages, mode: "local" };
    }

    try {
      return { chatId: thread.chatId, messages: await loadRemoteMessages(thread.chatId), mode: "remote" };
    } catch (error) {
      if (thread.source === "stored" && shouldRefreshStoredChat(error)) {
        removeChatThreadId(userId);
        const freshThread = await ensureRemoteChat(userId, { skipStored: true });
        if (!freshThread) {
          return { chatId: getOrCreateChatThreadId(userId), messages: localMessages, mode: "local" };
        }

        try {
          return { chatId: freshThread.chatId, messages: await loadRemoteMessages(freshThread.chatId), mode: "remote" };
        } catch {
          return { chatId: freshThread.chatId, messages: localMessages, mode: "remote" };
        }
      }

      if (isNoMessagesError(error)) {
        return { chatId: thread.chatId, messages: localMessages, mode: "remote" };
      }

      return { chatId: thread.chatId, messages: localMessages, mode: "remote" };
    }
  } catch {
    return { chatId: getOrCreateChatThreadId(userId), messages: localMessages, mode: "local" };
  }
}

export function createLocalChatClient(onMessage: (message: ChatMessage) => void): ChatClient {
  return {
    send(text) {
      window.setTimeout(() => {
        onMessage({
          text: createLocalReply(text),
          isUser: false,
          time: formatTime(),
        });
      }, 700);
    },
    close() {},
  };
}

type SocketChatClientOptions = {
  chatId: string;
  userId: string;
  onBotChunk?: (chunk: string, payload: unknown) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
};

export function createSocketChatClient({
  chatId,
  userId,
  onBotChunk,
  onConnect,
  onDisconnect,
  onError,
}: SocketChatClientOptions): ChatClient {
  const token = getAuthToken();
  const socket = io(`${socketBaseUrl()}${SOCKET_NAMESPACE}`, {
    auth: token ? { token } : undefined,
    reconnection: true,
    timeout: 10000,
    transports: ["websocket", "polling"],
  });

  socket.on(SOCKET_EVENTS.CONNECT, () => {
    onConnect?.();
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
    onDisconnect?.(reason);
  });

  socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: Error) => {
    onError?.(error);
  });

  socket.on(SOCKET_EVENTS.ERROR, (error: Error) => {
    onError?.(error);
  });

  socket.on(SOCKET_EVENTS.BOT_MESSAGE, (payload: unknown) => {
    const chunk = normalizeSocketChunk(payload);
    if (chunk) {
      onBotChunk?.(chunk, payload);
    }
  });

  return {
    send(text: string) {
      socket.emit(SOCKET_EVENTS.USER_MESSAGE, {
        chatId,
        content: text,
        userId,
      });
    },
    close() {
      socket.removeAllListeners();
      socket.close();
    },
  };
}
