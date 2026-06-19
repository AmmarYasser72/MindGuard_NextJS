"use client";

import { memo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { ChatMessage } from "@/src/types/chat";

type ChatMessageListProps = {
  hasUserMessage: boolean;
  isTyping: boolean;
  messages: ChatMessage[];
  onSendPrompt: (text: string) => void;
  prompts: string[];
};

const markdownPlugins = [remarkGfm, remarkBreaks];
const sentenceBoundaryPattern = /(?<=[.!?])\s+(?=[A-Z"'])/;
const listLeadPattern = /(^|\s)\d+\.\s|:\s*(?:\*\*|__)?\s*\d+\.\s/;
const inlineRulePattern = /\s+---\s+/g;
const extraLineBreakPattern = /\n{3,}/g;
const listFollowUpPattern =
  /^(\d+\.\s.*?)(\s+(?:Which|How|What|Would|Can you|Do you)\b.*)$/gm;

function normalizeAssistantText(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();

  if (!normalized) return normalized;

  let formatted = normalized
    .replace(inlineRulePattern, "\n\n---\n\n")
    .replace(extraLineBreakPattern, "\n\n");

  if (listLeadPattern.test(formatted)) {
    formatted = formatted
      .replace(/(:\s*(?:\*\*|__)?)(\s+)(?=\d+\.\s)/g, "$1\n\n")
      .replace(/[ \t]+(\d+\.\s)/g, "\n$1");
    formatted = formatted.replace(
      /(\n\d+\.[\s\S]*?)(\s+(?:Please|There|Would|Can|If|Remember|What's)\s)/,
      (_, listText, trailingText) =>
        `${listText}\n\n${trailingText.trimStart()}`,
    );
    formatted = formatted.replace(
      listFollowUpPattern,
      (_, listItem, followUp) => `${listItem}\n\n${followUp.trimStart()}`,
    );
  }

  if (formatted.includes("\n\n")) {
    return formatted;
  }

  const sentences = formatted
    .split(sentenceBoundaryPattern)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length < 3) {
    return formatted;
  }

  if (sentences.at(-1)?.endsWith("?")) {
    return `${sentences.slice(0, -1).join(" ")}\n\n${sentences.at(-1)}`;
  }

  const midpoint = Math.ceil(sentences.length / 2);
  return `${sentences.slice(0, midpoint).join(" ")}\n\n${sentences.slice(midpoint).join(" ")}`;
}

const markdownComponents: Components = {
  a({ children, href }) {
    return (
      <a
        className="break-words font-black text-[var(--primary)] underline decoration-[color-mix(in_srgb,var(--primary)_38%,transparent)] decoration-2 underline-offset-4 transition [overflow-wrap:anywhere] hover:text-[var(--primary-strong)]"
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-3 rounded-lg border-l-4 border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,var(--patient-card))] px-4 py-3 text-[var(--text-soft)]">
        {children}
      </blockquote>
    );
  },
  code({ children, className }) {
    const isBlockCode = className?.startsWith("language-");

    if (isBlockCode) {
      return (
        <code className={`${className} block whitespace-pre-wrap`}>
          {children}
        </code>
      );
    }

    return (
      <code className="rounded-md bg-[color-mix(in_srgb,var(--primary)_12%,var(--patient-card))] px-1.5 py-0.5 text-[0.9em] font-black text-[var(--primary)]">
        {children}
      </code>
    );
  },
  em({ children }) {
    return (
      <em className="font-semibold text-[var(--text-soft)]">{children}</em>
    );
  },
  h1({ children }) {
    return (
      <h1 className="mb-3 mt-0 text-[1.08rem] font-black leading-6 text-[var(--text)]">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="mb-3 mt-4 text-[1.02rem] font-black leading-6 text-[var(--text)] first:mt-0">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="mb-2 mt-4 text-[0.98rem] font-black leading-6 text-[var(--text)] first:mt-0">
        {children}
      </h3>
    );
  },
  hr() {
    return <hr className="my-4 border-t border-[var(--patient-line)]" />;
  },
  li({ children }) {
    return <li className="pl-1">{children}</li>;
  },
  ol({ children }) {
    return (
      <ol className="my-3 list-decimal space-y-2 pl-5 marker:font-black marker:text-[var(--primary)] sm:space-y-1.5">
        {children}
      </ol>
    );
  },
  p({ children }) {
    return <p className="my-3 first:mt-0 last:mb-0">{children}</p>;
  },
  pre({ children }) {
    return (
      <pre className="my-3 overflow-x-auto rounded-lg border border-[var(--patient-line)] bg-[var(--patient-card-muted)] p-3 text-[0.88rem] font-semibold text-[var(--text)]">
        {children}
      </pre>
    );
  },
  strong({ children }) {
    return (
      <strong className="font-black text-[var(--text)]">{children}</strong>
    );
  },
  table({ children }) {
    return (
      <div className="my-3 overflow-x-auto rounded-lg border border-[var(--patient-line)]">
        <table className="w-full min-w-96 border-collapse text-left text-[0.9rem]">
          {children}
        </table>
      </div>
    );
  },
  td({ children }) {
    return (
      <td className="border-t border-[var(--patient-line)] px-3 py-2 align-top">
        {children}
      </td>
    );
  },
  th({ children }) {
    return (
      <th className="bg-[var(--patient-card-muted)] px-3 py-2 font-black text-[var(--text)]">
        {children}
      </th>
    );
  },
  ul({ children }) {
    return (
      <ul className="my-3 list-disc space-y-2 pl-5 marker:text-[var(--primary)] sm:space-y-1.5">
        {children}
      </ul>
    );
  },
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
  const scrollKey = messages
    .map(
      (message) =>
        `${message.isUser ? "user" : "assistant"}:${message.time}:${message.text}`,
    )
    .join("\u001f");

  useEffect(() => {
    if (!listRef.current) return;
    if (!scrollKey && !isTyping) return;

    const behavior = hasHydratedScrollRef.current ? "smooth" : "auto";
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior,
        });
        hasHydratedScrollRef.current = true;
      });
    });
  }, [isTyping, scrollKey]);

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-1 sm:px-4 md:px-8 md:pb-6 xl:px-12"
      ref={listRef}
    >
      <div className="grid w-full gap-4 sm:gap-5">
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
        <div className="patient-chat-user-bubble rounded-[0.95rem] rounded-br-[0.4rem] bg-[linear-gradient(135deg,#8f6df0,#5a3ec7)] px-4 py-3.5 text-[0.95rem] font-medium leading-6 text-white shadow-[0_18px_30px_rgba(96,70,200,0.24)] sm:px-5 sm:py-4 sm:text-base md:px-6 md:py-4">
          {message.text}
        </div>
        <time className="mt-1 block pr-1 text-right text-[11px] font-bold text-slate-400">
          {message.time}
        </time>
      </article>
    );
  }

  const renderedText = normalizeAssistantText(message.text);

  return (
    <article className="patient-chat-ai-bubble mr-auto max-w-full rounded-[0.95rem] border-2 border-[#7b61d8] bg-white px-4 py-4 text-[#28243b] shadow-[0_16px_30px_rgba(84,61,145,0.08)] sm:max-w-[92%] sm:px-5 md:max-w-[52rem] md:px-6 md:py-5 xl:max-w-[60rem]">
      <div className="break-words text-[0.92rem] font-semibold leading-6 [overflow-wrap:anywhere] sm:text-[0.95rem]">
        <ReactMarkdown
          components={markdownComponents}
          remarkPlugins={markdownPlugins}
          skipHtml
        >
          {renderedText}
        </ReactMarkdown>
      </div>
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
