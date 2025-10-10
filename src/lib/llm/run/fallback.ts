import { Runnable } from "@langchain/core/runnables";
import { Haike3_5, Sonnet4, Sonnet4_5 } from "../models";

import { createLatencyCallback } from "./latency";
import { getFullPrompt } from "./helper";
import { enhancedInvoke, enhancedStream } from "./enhanced";

import * as TYPE from "./type";
import * as ERR from "@/lib/messages/error";

// フォールバック可能なLLM一覧
const fallbackLLMs: Runnable[] = [Sonnet4_5];

/**
 * レート制限に達したときに別のモデルに切り替える対策 + 指数バックオフ付き
 * @param runnable
 * @param input
 * @param options
 * @returns
 */
export async function runWithFallback(
  runnable: Runnable,
  input: Record<string, unknown>,
  options?: TYPE.RunWithFallbackOptions
): Promise<TYPE.LLMResponse | ReadableStream<TYPE.StreamChunk>> {
  // デフォルト値を設定
  const {
    mode = "invoke",
    parser,
    maxRetries = 3,
    baseDelay = 200,
    label = "",
    sessionId = "",
    onStreamEnd = async () => {},
  } = options || {};

  for (const model of fallbackLLMs) {
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        // LLM 呼び出し
        let pipeline = runnable.pipe(model);
        if (parser) {
          pipeline = pipeline.pipe(parser);
        }

        const callback = createLatencyCallback(
          label ? label : model.lc_kwargs.model
        );

        const result: TYPE.LLMResponse =
          mode === "stream"
            ? await pipeline.stream(input, {
                callbacks: [callback],
              })
            : await pipeline.invoke(input, {
                callbacks: [callback],
              });

        // ✅ 成功モデルのログ
        console.log(`[LLM] Using model: ${model.lc_kwargs.model}`);

        // 完成したプロンプトの取得
        const fullPrompt = await getFullPrompt(runnable, input);
        const payload: TYPE.LLMPayload = {
          label: label,
          llmName: model.lc_kwargs.model,
          sessionId: sessionId,
          fullPrompt: fullPrompt,
        };

        // stream 応答時終了後に処理を行う
        return mode === "stream"
          ? enhancedStream(
              result as AsyncIterable<TYPE.StreamChunk>,
              payload,
              callback,
              onStreamEnd
            )
          : await enhancedInvoke(
              result as TYPE.LLMParserResult,
              payload,
              callback
            );
      } catch (err) {
        const message = err instanceof Error ? err.message : ERR.UNKNOWN_ERROR;
        const isRateLimited =
          message.includes("429") ||
          message.includes("rate limit") ||
          message.includes("overloaded");
        if (!isRateLimited) throw err;

        // 指数バックオフの処理
        const delay = Math.min(baseDelay * 2 ** retry, 5000); // 最大5秒
        const jitter = Math.random() * 100;
        console.warn(
          `Model ${model.lc_kwargs.model} failed with rate limit (${
            retry + 1
          }/${maxRetries}): ${message}`
        );
        await new Promise((res) => setTimeout(res, delay + jitter));
      }
    }
    // 次のモデルにフォールバック（次のループへ）
    console.warn(
      `Model ${model.lc_kwargs.model} failed all retries. Trying next model.`
    );
  }
  // どのモデルでも成功しなかった場合
  throw new Error(ERR.ALL_FALLBACK_ERROR);
}
