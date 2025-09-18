"use client";

import { LOGS_ERROR_RESPONSE } from "@/app/api/logs/error/route";
import { useErrorStore } from "@/hooks/useErrorStore";
import { LOGS_ERROR_API } from "@/lib/api/path";
import { requestApi } from "@/lib/api/request/request";
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
        const res: LOGS_ERROR_RESPONSE = await requestApi("", LOGS_ERROR_API, {
          method: "POST",
          body: JSON.stringify({ logs: pending }),
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
