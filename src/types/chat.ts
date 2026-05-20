export type ChatMessage = {
  isUser: boolean;
  text: string;
  time: string;
};

export type ChatClient = {
  close: () => void;
  send: (text: string) => void;
};

export type ChatMode = "remote" | "local";

export type ChatState = {
  chatId: string;
  messages: ChatMessage[];
  mode: ChatMode;
};
