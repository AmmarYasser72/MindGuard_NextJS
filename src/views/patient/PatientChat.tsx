"use client";

import { useCallback } from "react";
import { useRouter } from "../../hooks/useRouter";
import ChatComposer from "./chat/ChatComposer";
import ChatHeader from "./chat/ChatHeader";
import ChatMessageList from "./chat/ChatMessageList";
import { SUPPORT_PROMPTS } from "./chat/chatView";
import { usePatientChat } from "./chat/usePatientChat";

export default function PatientChat({ userId }: { userId: string }) {
  const { navigate } = useRouter();
  const {
    connectionMode,
    draft,
    hasUserMessage,
    isLoading,
    isTyping,
    send,
    sendPrompt,
    setDraft,
    visibleMessages,
  } = usePatientChat(userId);
  const handleBack = useCallback(() => navigate("/patient-dashboard"), [navigate]);

  return (
    <main className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#f7f2ff] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.86),transparent_24%),radial-gradient(circle_at_88%_10%,rgba(167,139,250,0.24),transparent_26%),linear-gradient(180deg,#f8f4ff_0%,#f3ecff_46%,#efe8ff_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36vh] bg-[linear-gradient(180deg,rgba(137,111,226,0.12),transparent)]" />
      <section className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
        <ChatHeader connectionMode={connectionMode} onBack={handleBack} />

        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[2.4rem] bg-white pt-7 shadow-[0_-12px_38px_rgba(93,74,160,0.08)] md:pt-8 md:shadow-[0_-20px_48px_rgba(93,74,160,0.12)]">
          <div className="absolute left-1/2 top-3 h-1.5 w-10 -translate-x-1/2 rounded-full bg-slate-300" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(123,97,216,0.03),transparent)]" />

          <div className="flex min-h-0 flex-1 flex-col">
            <ChatMessageList
              hasUserMessage={hasUserMessage}
              isTyping={isTyping}
              messages={visibleMessages}
              onSendPrompt={sendPrompt}
              prompts={SUPPORT_PROMPTS}
            />

            <ChatComposer
              draft={draft}
              isDisabled={isLoading}
              onDraftChange={setDraft}
              onSend={send}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
