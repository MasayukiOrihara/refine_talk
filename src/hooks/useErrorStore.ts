import { createHash } from "@/lib/hash";
import { AppErrorDTO } from "@/lib/schema";
import { create } from "zustand";
import { useSessionStore } from "./useSessionId";

type State = {
  errors: AppErrorDTO[];
  push: (e: Omit<AppErrorDTO, "id" | "timestamp" | "hash" | "sent">) => void;
  markSent: (ids: string[]) => void;
  clear: () => void;
  remove: (id: string) => void;
};

// 型を定義（必要に応じて拡張）
type ErrStorePayload = {
  message: string;
  err: unknown;
  info?: React.ErrorInfo;
  tags?: string[];
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

/**
 * エラーが出た時積む共通関数
 * @param message
 * @param err
 * @param info
 * @param tags
 */
export function errStore(payload: ErrStorePayload) {
  const { message, err, info, tags } = payload;
  const { sessionId } = useSessionStore.getState();

  // 1) 画面には優しく、開発者には詳細を
  console.error(message, err, info);

  // 2) unknown → Error へ正規化
  const e = err instanceof Error ? err : new Error(String(err));

  // messageに html 入った時の回避(message は上限2000文字のため超えるとバグる)
  const RESIZEOBSERVER_MESSAGE =
    "<title>404: This page could not be found.</title>";
  let errorMessage = e.message;
  if (
    typeof errorMessage === "string" &&
    errorMessage.includes(RESIZEOBSERVER_MESSAGE)
  ) {
    errorMessage = RESIZEOBSERVER_MESSAGE;
  }

  // 3) 状態へ集約（後でバッチ送信）
  const { push } = useErrorStore.getState();
  push({
    sessionId: sessionId,
    message: errorMessage,
    detail: JSON.stringify({ info }, null, 2), // componentStackは下で別埋め
    name: e.name,
    stack: e.stack,
    componentStack: info?.componentStack || undefined,
    severity: "error",
    tags: tags,
  });
}
