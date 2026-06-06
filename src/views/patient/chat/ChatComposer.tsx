"use client";

import { memo } from "react";
import Icon from "@/src/components/common/Icon";
import type { KeyboardEvent } from "react";

type ChatComposerProps = {
  draft: string;
  isDisabled: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

function ChatComposer({
  draft,
  isDisabled,
  onDraftChange,
  onSend,
}: ChatComposerProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <form
      className="patient-chat-composer relative z-20 flex w-full shrink-0 items-center gap-4 border-t border-slate-100 bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 md:px-6 md:pb-5 md:pt-4 xl:px-8"
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
    >
      <textarea
        className="patient-chat-input min-h-12 max-h-28 min-w-0 flex-1 resize-none rounded-[1rem] bg-[#f3edfb] px-5 py-3.5 text-sm font-semibold leading-5 text-slate-900 outline-none placeholder:text-[#b5adc2] focus:ring-4 focus:ring-[#eadfff] disabled:cursor-not-allowed disabled:opacity-70 md:min-h-14 md:text-[0.95rem] xl:min-h-16"
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isDisabled ? "Connecting chat..." : "Ask me anything..."}
        rows={1}
        disabled={isDisabled}
      />
      <button
        type="submit"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#8a67ea,#5a3fc8)] text-white shadow-[0_14px_24px_rgba(94,68,200,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(94,68,200,0.34)] focus:outline-none focus:ring-4 focus:ring-[#d8ccff] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        aria-label="Send"
        disabled={isDisabled || !draft.trim()}
      >
        <Icon name="send" size={22} color="#fff" />
      </button>
    </form>
  );
}

export default memo(ChatComposer);
