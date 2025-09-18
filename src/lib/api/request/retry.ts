import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { defaultRetry, is5xx } from "./defaultPolicy";
import { HttpMethod, RequestOptions, RetryOptions } from "./type";
import { expBackoff, sleep } from "./helper";

/**
 * リクエストを1回だけ送る薄い関数（Axios の設定だけ担当）
 * @param baseUrl
 * @param path
 * @param param2
 * @returns
 */
export async function sendOnce<T = unknown>(
  baseUrl: string,
  path: string,
  {
    method = "GET",
    body,
    headers,
    timeoutMs = 15000,
    signal,
  }: RequestOptions = {}
): Promise<AxiosResponse<T>> {
  const config: AxiosRequestConfig = {
    url: baseUrl + path,
    method,
    // POST/PUT/PATCH のときだけセット
    data: ["POST", "PUT", "PATCH"].includes(method) ? body : undefined,
    // Cookie 同送
    withCredentials: true,
    timeout: timeoutMs,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      // フロントからなら process.env は使えないので注意（必要なら引数で受ける）
      // todo: 引数で受ける挙動に変更予定
      ...(process.env.ACCESS_TOKEN
        ? { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` }
        : {}),
    },
  };
  return axios.request<T>(config);
}

/**
 * リトライ判定（ネットワーク/タイムアウト/5xx/ポリシー指定）
 * @param err
 * @param cfg
 * @param method
 * @returns
 */
export function isRetryableAxiosError(
  err: unknown,
  cfg: Required<RetryOptions>,
  method: HttpMethod
): boolean {
  if (!axios.isAxiosError(err)) return false;

  const status = err.response?.status;
  const code = err.code;

  // メソッドが対象外なら即NG（POST はデフォ除外）
  if (!cfg.retryOnMethods.includes(method)) return false;

  // 5xx は基本リトライ
  if (is5xx(status)) return true;

  // 明示ステータス （408/425/429など）を含めたらリトライ
  if (status && cfg.retryOnStatuses.includes(status)) return true;

  // ネットワーク系・タイムアウトなど（環境でコード名は異なる）もリトライ
  const transientCodes = new Set([
    "ECONNRESET",
    "ECONNABORTED",
    "ENOTFOUND",
    "ETIMEDOUT",
    "EAI_AGAIN",
    "ERR_NETWORK",
  ]);
  if (code && transientCodes.has(code)) return true;

  return false;
}

/**
 * リトライ制御（指数バックオフ＋ジッター）
 * @param runner
 * @param method
 * @param retry
 * @returns
 */
export async function withRetry<T>(
  runner: (attempt: number) => Promise<T>,
  method: HttpMethod,
  retry?: RetryOptions
): Promise<T> {
  const cfg = { ...defaultRetry, ...(retry ?? {}) };

  let lastErr: unknown;
  for (let attempt = 0; attempt < cfg.maxAttempts; attempt++) {
    try {
      return await runner(attempt);
    } catch (err) {
      lastErr = err;
      const retryable = isRetryableAxiosError(err, cfg, method);
      const isLast = attempt >= cfg.maxAttempts - 1;
      if (!retryable || isLast) break;

      const wait = expBackoff(
        attempt,
        cfg.baseDelayMs,
        cfg.maxDelayMs,
        cfg.jitter
      );

      console.warn(
        `API失敗 (試行${attempt + 1}/${
          cfg.maxAttempts
        }) → ${wait}ms 待機してリトライ`
      );
      await sleep(wait);
    }
  }
  throw lastErr;
}
