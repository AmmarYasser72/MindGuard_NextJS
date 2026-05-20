const prefix = "mindguard_react_";

function safeLocalStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const localStorage = safeLocalStorage();
      if (!localStorage) return fallback;
      const raw = localStorage.getItem(prefix + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    const localStorage = safeLocalStorage();
    if (!localStorage) return;
    localStorage.setItem(prefix + key, JSON.stringify(value));
  },
  remove(key: string) {
    const localStorage = safeLocalStorage();
    if (!localStorage) return;
    localStorage.removeItem(prefix + key);
  },
};
