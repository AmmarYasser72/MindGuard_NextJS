import { WELCOME_MESSAGE_TEXT } from "@/src/services/chatService";
import type { ChatMessage } from "@/src/types/chat";

export type ConnectionMode = "connecting" | "loading" | "local" | "remote";

export const SUPPORT_PROMPTS = ["Show me what you can do"];

export function getVisibleMessages(messages: ChatMessage[]) {
  return messages.filter((message, index) => {
    const isDefaultGreeting =
      index === 0 && !message.isUser && message.text === WELCOME_MESSAGE_TEXT;
    return !isDefaultGreeting;
  });
}

export function statusCopy(connectionMode: ConnectionMode) {
  if (connectionMode === "remote") return "Online";
  if (connectionMode === "connecting") return "Connecting";
  if (connectionMode === "loading") return "Loading";
  return "Local mode";
}
