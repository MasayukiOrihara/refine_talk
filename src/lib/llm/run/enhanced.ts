import { extractOutputText } from "./helper";
import { saveLlmLog } from "@/lib/supabase/services/saveLlmLog.service";
import { createLatencyCallback } from "./latency";

import * as TYPE from "./type";

/**
 * invoke したときの終了処理
 * @param result
 * @param payload
 * @param callback
 * @returns
 */
export const enhancedInvoke = async (
  result: TYPE.LLMParserResult,
  payload: TYPE.LLMPayload,
  callback: ReturnType<typeof createLatencyCallback>
): Promise<TYPE.LLMParserResult> => {
  const outputText = extractOutputText(result);

  // invoke はここで onLLMEnd が済んでる
  const metrics = callback.getMetrics();
  const usage = callback.getUsage();

  // DB 保存
  try {
    await saveLlmLog({
      sessionId: payload.sessionId,
      label: payload.label,
      llmName: payload.llmName,
      fullPrompt: payload.fullPrompt,
      fullOutput: outputText,
      usage,
      metrics,
    });
  } catch (e) {
    // ログを残せなかっただけなので警告のみ
    console.warn("[llm_logs.save invoke] insert failed:", e);
  }

  return result;
};

/**
 * ストリーム終了後の処理
 * @param stream
 * @param payload
 * @param callback
 * @param onStreamEnd
 * @returns
 */
export const enhancedStream = (
  stream: AsyncIterable<TYPE.StreamChunk>,
  payload: TYPE.LLMPayload,
  callback: ReturnType<typeof createLatencyCallback>,
  onStreamEnd?: (response: string) => Promise<void>
) =>
  new ReadableStream({
    async start(controller) {
      let response = "";

      for await (const chunk of stream) {
        const text = chunk.content || "";
        response += text; // ログ用にはタグ付きで保持

        if (typeof text === "string") {
          controller.enqueue(text);
        } else if (chunk.additional_kwargs) {
          // 必要ならフォールバック
          controller.enqueue(JSON.stringify(chunk.additional_kwargs));
        }
      }

      // 終了時に外部処理を走らせる
      if (onStreamEnd) {
        await onStreamEnd(response);

        // 情報を外部保存
        const metrics = callback.getMetrics();
        const usage = callback.getUsage();

        // fullOutput は stream で溜めた response
        // BD 保存
        try {
          await saveLlmLog({
            sessionId: payload.sessionId,
            label: payload.label,
            llmName: payload.llmName,
            fullPrompt: payload.fullPrompt,
            fullOutput: response,
            usage,
            metrics,
          });
        } catch (e) {
          // ログを残せなかっただけなので警告のみ
          console.error("[llm_logs.save stream] insert failed:", e);
        }
      }
      controller.close();
    },
  });
