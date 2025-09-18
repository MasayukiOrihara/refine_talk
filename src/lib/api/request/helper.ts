import { HTTP_ERROR, UNKNOWN_ERROR } from "@/lib/messages/error";
import axios from "axios";

// 定数
const AUTHENTICATION_TITLE = "<title>Authentication Required</title>";
const AUTHENTICATION_MESSAGE = "認証が必要です";

/**
 * 待機
 * @param ms
 * @returns
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * バックオフ関数
 * minに フルジッターをかける実装
 * スパイク回避に有効
 * @param attempt
 * @param base
 * @param max
 * @param jitter
 * @returns
 */
export function expBackoff(
  attempt: number, // 0,1,2...
  base: number,
  max: number,
  jitter: "full" | "none"
): number {
  const delay = Math.min(base * 2 ** attempt, max);
  if (jitter === "full") {
    return Math.floor(Math.random() * delay); // 0..delay のフルジッター
  }
  return delay;
}

/**
 * 表示・ログ用のエラー整形
 * @param err
 * @returns
 */
export function parseAxiosError(err: unknown): {
  message: string;
  status?: number;
  code?: string;
} {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const code = err.code;
    const body = err.response?.data;

    // “Authentication Required” ページ対策
    if (
      status === 401 &&
      typeof body === "string" &&
      body.includes(AUTHENTICATION_TITLE)
    ) {
      return {
        message: AUTHENTICATION_MESSAGE,
        status,
        code,
      };
    }

    // 一般的な整形
    const msg =
      (typeof body === "string" && body.slice(0, 200)) ||
      (typeof body?.message === "string" && body.message) ||
      err.message ||
      HTTP_ERROR;
    return { message: msg, status, code };
  }
  return { message: err instanceof Error ? err.message : UNKNOWN_ERROR };
}
