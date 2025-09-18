import { RetryOptions } from "./type";

/**
 * デフォルト・ポリシー
 */
export const defaultRetry: Required<RetryOptions> = {
  maxAttempts: 4, // 初回+リトライ3回
  baseDelayMs: 200,
  maxDelayMs: 5000,
  jitter: "full",
  retryOnMethods: ["GET", "PUT", "PATCH", "DELETE"], // ※POSTは安全でない場合があるので除外
  retryOnStatuses: [408, 425, 429], // 429やタイムアウト系
};

/**
 * 5xx かどうか
 * ※ 5xx は常に候補に含める運用にします
 * @param s
 * @returns
 */
export const is5xx = (s?: number) => !!s && s >= 500 && s < 600;
