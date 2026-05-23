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
    <main className="patient-shell patient-chat-shell dashboard-shell relative flex h-dvh max-h-dvh flex-col overflow-hidden text-slate-950">
      <div className="patient-chat-backdrop pointer-events-none absolute inset-0" />
      <div className="patient-chat-top-fade pointer-events-none absolute inset-x-0 top-0 h-[36vh]" />
      <section className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
        <ChatHeader connectionMode={connectionMode} onBack={handleBack} />

        <section className="patient-chat-panel relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[2.4rem] bg-white pt-7 shadow-[0_-12px_38px_rgba(93,74,160,0.08)] md:pt-8 md:shadow-[0_-20px_48px_rgba(93,74,160,0.12)]">
          <div className="patient-chat-handle absolute left-1/2 top-3 h-1.5 w-10 -translate-x-1/2 rounded-full bg-slate-300" />
          <div className="patient-chat-panel-fade pointer-events-none absolute inset-x-0 top-0 h-16" />

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
