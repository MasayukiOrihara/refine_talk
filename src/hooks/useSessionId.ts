import { create } from "zustand";

type SessionState = {
  sessionId: string | undefined;
  init: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: undefined,
  init: () => {
    let id = sessionStorage.getItem("session_id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("session_id", id);
    }
    set({ sessionId: id });
  },
}));
