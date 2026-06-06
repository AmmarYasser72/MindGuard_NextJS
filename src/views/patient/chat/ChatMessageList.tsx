"use client";

import { memo, useEffect, useRef } from "react";
import type { ChatMessage } from "@/src/types/chat";

type ChatMessageListProps = {
  hasUserMessage: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  onSendPrompt: (text: string) => void;
  prompts: string[];
};

function ChatMessageList({
  hasUserMessage,
  isTyping,
  messages,
  onSendPrompt,
  prompts,
}: ChatMessageListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const hasHydratedScrollRef = useRef(false);

  useEffect(() => {
    if (!listRef.current) return;
    if (!messages.length && !isTyping) return;

    const behavior = hasHydratedScrollRef.current ? "smooth" : "auto";
    window.requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior,
      });
      hasHydratedScrollRef.current = true;
    });
  }, [isTyping, messages.length]);

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-1 md:px-8 md:pb-6 xl:px-12"
      ref={listRef}
    >
      <div className="grid w-full gap-5">
        {!hasUserMessage
          ? prompts.map((prompt) => (
              <button
                type="button"
                className="patient-chat-user-bubble ml-auto w-fit max-w-[82%] rounded-[0.95rem] rounded-br-[0.4rem] bg-[linear-gradient(135deg,#8f6df0,#5a3ec7)] px-5 py-4 text-left text-base font-medium text-white shadow-[0_18px_30px_rgba(96,70,200,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(96,70,200,0.3)] md:max-w-[48%] md:px-6"
                key={prompt}
                onClick={() => onSendPrompt(prompt)}
              >
                {prompt}
              </button>
            ))
          : null}

        {messages.map((message, index) => (
          <ChatBubble
            message={message}
            key={`${message.text}-${message.time}-${index}`}
          />
        ))}
        {isTyping ? <TypingCard /> : null}
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.isUser) {
    return (
      <article className="ml-auto w-fit max-w-[84%] md:max-w-[46rem] xl:max-w-[52rem]">
        <div className="patient-chat-user-bubble rounded-[0.95rem] rounded-br-[0.4rem] bg-[linear-gradient(135deg,#8f6df0,#5a3ec7)] px-5 py-4 text-base font-medium leading-6 text-white shadow-[0_18px_30px_rgba(96,70,200,0.24)] md:px-6 md:py-4">
          {message.text}
        </div>
        <time className="mt-1 block pr-1 text-right text-[11px] font-bold text-slate-400">
          {message.time}
        </time>
      </article>
    );
  }

  return (
    <article className="patient-chat-ai-bubble mr-auto max-w-[92%] rounded-[0.95rem] border-2 border-[#7b61d8] bg-white px-5 py-4 text-[#28243b] shadow-[0_16px_30px_rgba(84,61,145,0.08)] md:max-w-[52rem] md:px-6 md:py-5 xl:max-w-[60rem]">
      <p className="whitespace-pre-wrap text-[0.95rem] font-semibold leading-6">
        {message.text}
      </p>
      <time className="mt-3 block text-right text-[11px] font-bold text-slate-400">
        {message.time}
      </time>
    </article>
  );
}

function TypingCard() {
  return (
    <article
      className="patient-chat-ai-bubble mr-auto flex w-fit items-center gap-1.5 rounded-[0.85rem] border-2 border-[#7b61d8] bg-white px-5 py-4 shadow-[0_16px_30px_rgba(84,61,145,0.08)]"
      aria-label="AI is typing"
    >
      <span className="h-2 w-2 animate-bounce rounded-full bg-[#7b61d8] [animation-delay:-0.2s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-[#7b61d8] [animation-delay:-0.1s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-[#7b61d8]" />
    </article>
  );
}

export default memo(ChatMessageList);
