"use client";

import { memo } from "react";
import Icon from "@/src/components/common/Icon";
import { statusCopy } from "./chatView";
import type { ConnectionMode } from "./chatView";

type ChatHeaderProps = {
  connectionMode: ConnectionMode;
  onBack: () => void;
};

function ChatHeader({ connectionMode, onBack }: ChatHeaderProps) {
  return (
    <header className="relative z-20 shrink-0 px-4 pb-3 pt-4 md:px-8 md:pb-4 md:pt-5 xl:px-10">
      <div className="flex w-full items-center gap-3 pt-1">
        <button
          type="button"
          className="patient-chat-back-button grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70 text-[#8168d9] shadow-sm transition hover:-translate-x-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#e7ddff]"
          onClick={onBack}
          aria-label="Back"
        >
          <Icon name="chevron-left" size={22} />
        </button>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#8068e8,#5c45c7)] text-white shadow-[0_10px_18px_rgba(91,69,199,0.22)] md:h-9 md:w-9">
          <Icon name="bot-message-square" size={17} color="#fff" />
        </span>
        <div className="min-w-0">
          <h1 className="patient-chat-title text-[1rem] font-black leading-none tracking-[-0.03em] text-[#7560c9] md:text-[1.18rem] xl:text-[1.26rem]">
            Smart AI Chat
          </h1>
          <p className="patient-chat-status mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#9b8ad4]">
            {statusCopy(connectionMode)}
          </p>
        </div>
      </div>
    </header>
  );
}

export default memo(ChatHeader);
