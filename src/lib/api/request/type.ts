/* =====  リクエスト API 内で使う型 ===== */

/**
 * メソッド名を指定するユニオン型
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * リクエストを送る際のオプション型
 * メソッド、ボディ、ヘッダー、タイムアウト、AbortSignal、リトライ設定などを受け取る器
 */
export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  retry?: RetryOptions;
};

/**
 * リトライをする際のオプション型
 * リトライ回数・待機時間・ジッター方式・対象メソッド/ステータスを制御
 */
export type RetryOptions = {
  maxAttempts?: number; // 総試行回数（初回含む）
  baseDelayMs?: number; // 初回待機
  maxDelayMs?: number; // 上限
  jitter?: "full" | "none"; // ジッター方式
  retryOnMethods?: HttpMethod[];
  retryOnStatuses?: number[]; // 明示的に追加したいステータス（デフォに加算）
};
