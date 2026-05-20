export type ApiRecord = Record<string, unknown>;

export type ApiError = Error & {
  code?: string;
  data?: unknown;
  details?: unknown;
  status?: number;
};

export type RequestOptions = RequestInit & {
  auth?: boolean;
  timeoutMs?: number;
};
