import { parseAxiosError } from "./helper";
import { sendOnce, withRetry } from "./retry";
import { RequestOptions } from "./type";

/**
 * 公開：これが最終的な薄い共通関数
 * @param baseUrl
 * @param path
 * @param opts
 * @returns
 */
export async function requestApi<T = unknown>(
  baseUrl: string,
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const method = opts.method ?? "GET";
  return withRetry<T>(
    async () => {
      const res = await sendOnce<T>(baseUrl, path, opts);
      return res.data;
    },
    method,
    opts.retry
  ).catch((err) => {
    const { message, status, code } = parseAxiosError(err);
    // 共通エラー文言を付与
    throw new Error(
      `[API ERROR] ${message}${status ? ` (status ${status})` : ""}${
        code ? ` [${code}]` : ""
      }`
    );
  });
}
