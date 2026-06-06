"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createLocalChatClient,
  createSocketChatClient,
  formatTime,
  loadChatState,
  saveChatMessages,
} from "@/src/services/chatService";
import { useAuth } from "@/src/hooks/useAuth";
import { getVisibleMessages } from "./chatView";
import type { ChatClient, ChatMessage } from "@/src/types/chat";
import type { ConnectionMode } from "./chatView";

const STREAM_IDLE_MS = 450;

type WindowWithIdleCallback = Window &
  typeof globalThis & {
    cancelIdleCallback?: (id: number) => void;
    requestIdleCallback?: (callback: () => void) => number;
  };

export function usePatientChat(userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>("loading");
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const chatClientRef = useRef<ChatClient | null>(null);
  const activeBotMessageIndexRef = useRef<number | null>(null);
  const streamTimerRef = useRef<number | null>(null);
  const hasRemoteConnectionRef = useRef(false);
  const pendingMessageRef = useRef("");
  const chatOwnerId = useMemo(
    () => user?._id || user?.id || user?.uid || user?.email || userId,
    [user?._id, user?.email, user?.id, user?.uid, userId],
  );
  const visibleMessages = useMemo(
    () => getVisibleMessages(messages),
    [messages],
  );
  const hasUserMessage = useMemo(
    () => visibleMessages.some((message) => message.isUser),
    [visibleMessages],
  );

  const clearStreamTimer = useCallback(() => {
    if (streamTimerRef.current) {
      window.clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  }, []);

  const resetStreamingState = useCallback(() => {
    clearStreamTimer();
    activeBotMessageIndexRef.current = null;
  }, [clearStreamTimer]);

  const scheduleStreamReset = useCallback(() => {
    clearStreamTimer();
    streamTimerRef.current = window.setTimeout(() => {
      activeBotMessageIndexRef.current = null;
      streamTimerRef.current = null;
    }, STREAM_IDLE_MS);
  }, [clearStreamTimer]);

  const appendBotMessage = useCallback(
    (message: ChatMessage) => {
      pendingMessageRef.current = "";
      resetStreamingState();
      setIsTyping(false);
      setMessages((current) => [...current, message]);
    },
    [resetStreamingState],
  );

  const appendBotChunk = useCallback(
    (chunk: string) => {
      if (!chunk) return;

      setIsTyping(false);
      pendingMessageRef.current = "";
      setMessages((current) => {
        const next = [...current];
        const activeIndex = activeBotMessageIndexRef.current;

        if (
          activeIndex === null ||
          !next[activeIndex] ||
          next[activeIndex].isUser
        ) {
          activeBotMessageIndexRef.current = next.length;
          next.push({
            text: chunk,
            isUser: false,
            time: formatTime(),
          });
          return next;
        }

        const currentMessage = next[activeIndex];
        next[activeIndex] = {
          ...currentMessage,
          text: `${currentMessage.text}${chunk}`,
        };
        return next;
      });

      scheduleStreamReset();
    },
    [scheduleStreamReset],
  );

  const closeClient = useCallback(() => {
    chatClientRef.current?.close();
    chatClientRef.current = null;
  }, []);

  const attachLocalClient = useCallback(
    ({ replayPending = false } = {}) => {
      const pendingText = pendingMessageRef.current;
      closeClient();
      hasRemoteConnectionRef.current = false;
      chatClientRef.current = createLocalChatClient(appendBotMessage);
      setConnectionMode("local");

      if (replayPending && pendingText) {
        pendingMessageRef.current = "";
        setIsTyping(true);
        chatClientRef.current?.send(pendingText);
        return;
      }

      setIsTyping(false);
    },
    [appendBotMessage, closeClient],
  );

  const attachSocketClient = useCallback(
    (chatId: string) => {
      closeClient();
      hasRemoteConnectionRef.current = false;
      chatClientRef.current = createSocketChatClient({
        chatId,
        userId: chatOwnerId,
        onBotChunk: appendBotChunk,
        onConnect() {
          hasRemoteConnectionRef.current = true;
          setConnectionMode("remote");
        },
        onDisconnect() {
          resetStreamingState();
          setConnectionMode("connecting");
        },
        onError() {
          if (!hasRemoteConnectionRef.current || pendingMessageRef.current) {
            attachLocalClient({ replayPending: true });
            return;
          }

          setConnectionMode("connecting");
        },
      });
    },
    [
      appendBotChunk,
      attachLocalClient,
      chatOwnerId,
      closeClient,
      resetStreamingState,
    ],
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!text) return;

      resetStreamingState();
      setMessages((current) => [
        ...current,
        { text, isUser: true, time: formatTime() },
      ]);
      pendingMessageRef.current = text;

      if (!chatClientRef.current) {
        attachLocalClient();
      }

      setIsTyping(true);

      try {
        chatClientRef.current?.send(text);
      } catch {
        attachLocalClient();
        setIsTyping(true);
        chatClientRef.current?.send(text);
      }
    },
    [attachLocalClient, resetStreamingState],
  );

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(text);
    setDraft("");
  }, [draft, sendMessage]);

  const sendPrompt = useCallback(
    (text: string) => {
      sendMessage(text);
      setDraft("");
    },
    [sendMessage],
  );

  useEffect(() => {
    let active = true;

    loadChatState(chatOwnerId)
      .then((state) => {
        if (!active) return;

        setMessages(state.messages);
        resetStreamingState();

        if (state.mode === "remote" && state.chatId) {
          setConnectionMode("connecting");
          attachSocketClient(state.chatId);
          return;
        }

        attachLocalClient();
      })
      .catch(() => {
        if (!active) return;
        attachLocalClient();
      });

    return () => {
      active = false;
      resetStreamingState();
      closeClient();
    };
  }, [
    attachLocalClient,
    attachSocketClient,
    chatOwnerId,
    closeClient,
    resetStreamingState,
  ]);

  useEffect(() => {
    if (!messages.length) return;

    const currentWindow = window as WindowWithIdleCallback;
    const persistMessages = () => saveChatMessages(chatOwnerId, messages);

    if (currentWindow.requestIdleCallback) {
      const idleId = currentWindow.requestIdleCallback(persistMessages);
      return () => currentWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(persistMessages, 0);
    return () => window.clearTimeout(timeoutId);
  }, [chatOwnerId, messages]);

  return {
    connectionMode,
    draft,
    hasUserMessage,
    isLoading: connectionMode === "loading",
    isTyping,
    send,
    sendPrompt,
    setDraft,
    visibleMessages,
  };
}
