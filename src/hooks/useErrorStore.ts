// useErrorStore.ts
import { createHash } from "@/lib/hash";
import { create } from "zustand";

type Severity = "error" | "warn" | "info";

export type AppError = {
  id: string; // ランダムID
  message: string; // 表示用メッセージ
  detail?: string; // 追加情報(JSON文字列でも可)
  name?: string; // Error.name
  stack?: string; // Error.stack
  componentStack?: string; // React ErrorInfo.componentStack
  timestamp: number; // Date.now()
  severity?: Severity;
  tags?: string[]; // ["ui", "network", ...]
  hash?: string; // 重複判定用( message+stack のハッシュ等 )
  sent?: boolean; // サーバ送信済フラグ
};

type State = {
  errors: AppError[];
  push: (e: Omit<AppError, "id" | "timestamp" | "hash" | "sent">) => void;
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
