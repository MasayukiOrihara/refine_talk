"use client";

import { useErrorStore } from "@/hooks/useErrorStore";
import { useEffect } from "react";

/**
 * useErrorStore に集約したエラーログを API に送る
 * @returns
 */
export function ErrorFlushAgent() {
  const errors = useErrorStore((s) => s.errors);

  useEffect(() => {
    const pending = errors.filter((e) => !e.sent);
    if (pending.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/logs/error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logs: pending }),
          keepalive: true, // ページ離脱時も送れる可能性UP
        });
        if (res.ok) {
          useErrorStore.getState().markSent(pending.map((p) => p.id));
        }
      } catch {
        // 送信失敗は再試行に任せる（ここで何もしない）
      }
    }, 500); // 0.5s デバウンスでスパム抑制

    return () => clearTimeout(timer);
  }, [errors]);

  return null;
}
