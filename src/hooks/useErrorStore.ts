import { createHash } from "@/lib/hash";
import { AppErrorDTO } from "@/lib/schema";
import { create } from "zustand";

type State = {
  errors: AppErrorDTO[];
  push: (e: Omit<AppErrorDTO, "id" | "timestamp" | "hash" | "sent">) => void;
  markSent: (ids: string[]) => void;
  clear: () => void;
  remove: (id: string) => void;
};

/**
 * エラーを集約する関数
 */
export const useErrorStore = create<State>((set, get) => ({
  errors: [],
  push: (e) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const hash = createHash((e.message ?? "") + (e.stack ?? ""));

    // 直近の同一ハッシュが連続するならスキップ（スパム防止）
    const last = get().errors.at(-1);
    if (last && last.hash === hash) return;

    set((s) => ({
      errors: [...s.errors, { id, timestamp, hash, sent: false, ...e }],
    }));
  },
  markSent: (ids) =>
    set((s) => ({
      errors: s.errors.map((x) =>
        ids.includes(x.id) ? { ...x, sent: true } : x
      ),
    })),
  clear: () => set({ errors: [] }),
  remove: (id) => set((s) => ({ errors: s.errors.filter((x) => x.id !== id) })),
}));
