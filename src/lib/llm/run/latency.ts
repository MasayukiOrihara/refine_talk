import { isLLMEndPayload } from "./helper";
import * as TYPE from "./type";

/**
 * 呼び出し時間測定用のコールバック関数（ラベル付き）
 * @param label
 * @returns
 */
export const createLatencyCallback = (label: string) => {
  let startTime = 0;
  let firstTokenTime: number | null = null;
  let finishedAt: number | null = null;
  let usage: TYPE.Usage | null = null;

  const metrics: TYPE.LatencyMetrics = {
    label,
    startedAt: Date.now(),
  };

  return {
    // LLM 呼び出し直後
    handleLLMStart(): void {
      startTime = Date.now();
      metrics.startedAt = startTime;
    },

    // 最初のトークン
    handleLLMNewToken(): void {
      if (firstTokenTime === null) {
        firstTokenTime = Date.now() - startTime;
        metrics.firstTokenMs = firstTokenTime;

        const seconds = Math.floor(firstTokenTime / 1000);
        const milliseconds = firstTokenTime % 1000;

        // ログに出力
        console.log(
          `[${label}] first token latency: ${seconds}s ${milliseconds}ms`
        );
      }
    },

    // 出力完了
    handleLLMEnd(payload?: unknown): void {
      // 計測秒数を計算
      finishedAt = Date.now();
      const elapsedMs = finishedAt - startTime;
      metrics.finishedAt = finishedAt;
      metrics.totalMs = elapsedMs;

      const seconds = Math.floor(elapsedMs / 1000);
      const milliseconds = elapsedMs % 1000;

      // ログに出力
      console.log(`[${label}] all latency: ${seconds}s ${milliseconds}ms`);

      // usageを多段フォールバックで取得
      if (isLLMEndPayload(payload)) {
        const u =
          payload.llmOutput?.tokenUsage ||
          payload.usage ||
          payload.response?.usage ||
          null;

        // todo: プロンプトのトークン数が取得できていない（優先度低）
        if (u) {
          usage = {
            prompt: u.promptTokens ?? u.prompt_tokens ?? u.input_tokens ?? 0,
            completion:
              u.completionTokens ?? u.completion_tokens ?? u.output_tokens ?? 0,
            total: u.totalTokens ?? u.total_tokens ?? undefined,
          };
        }
      }
    },

    // 外から計測結果を取得
    getMetrics(): TYPE.LatencyMetrics {
      return { ...metrics };
    },

    getUsage(): TYPE.Usage | null {
      return usage;
    },
  };
};
