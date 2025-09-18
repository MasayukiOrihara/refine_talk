import { Runnable } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";

import * as TYPE from "./type";

/**
 * オブジェクト型ガード関数
 * @param x
 * @returns
 */
export function isLLMEndPayload(x: unknown): x is TYPE.LLMEndPayload {
  return typeof x === "object" && x !== null;
}

/**
 * プロンプト全文取得
 * @param runnable
 * @param input
 * @returns
 */
export const getFullPrompt = async (
  runnable: Runnable,
  input: Record<string, unknown>
): Promise<string> => {
  const fullPrompt = await (runnable as PromptTemplate).format(input);
  return fullPrompt;
};

/**
 * LangChainの result から「人間が読むテキスト」を安全に取り出す
 * todo: 総当たりで対処してて気に食わない
 * @param result
 * @returns
 */
export function extractOutputText(result: unknown): string {
  // 1) すでに string
  if (typeof result === "string") return result;

  // 2) LangChain BaseMessage / AIMessage っぽい（今回のケース）
  //    {"lc":1,"type":"constructor","id":["langchain_core","messages","AIMessage"],"kwargs":{...}}
  if (typeof result === "object" && result !== null) {
    const r = result as { kwargs?: { content?: unknown }; content?: unknown };

    if (r?.kwargs?.content !== undefined) {
      return normalizeMessageContent(r.kwargs.content);
    }
    if (r?.content !== undefined) {
      return normalizeMessageContent(r.content);
    }
  }

  // 3) ChatResult / LLMResult / generations[]
  //    e.g. { generations: [{ text, message }], ...}
  // LangChainの世代オブジェクトの型定義
  interface LangChainGeneration {
    text?: string;
    message?: {
      content: unknown;
    };
  }
  interface LangChainResult {
    generations: LangChainGeneration[] | LangChainGeneration[][];
  }
  // 型ガード関数
  function isLangChainResult(result: unknown): result is LangChainResult {
    return (
      typeof result === "object" &&
      result !== null &&
      "generations" in result &&
      Array.isArray((result as Record<string, unknown>).generations)
    );
  }
  function isLangChainGeneration(gen: unknown): gen is LangChainGeneration {
    return typeof gen === "object" && gen !== null;
  }
  if (isLangChainResult(result) && result.generations.length > 0) {
    const generations = result.generations;
    const gen0 = Array.isArray(generations[0])
      ? generations[0][0]
      : generations[0];

    if (isLangChainGeneration(gen0)) {
      if (typeof gen0.text === "string") return gen0.text;
      if (gen0.message?.content !== undefined) {
        return normalizeMessageContent(gen0.message.content);
      }
    }
  }

  // 4) OutputParser でオブジェクトにされた場合
  //    よくある key: "output" / "answer" / "content" などを試す
  if (typeof result === "object" && result !== null) {
    const r = result as { output?: string; answer?: string; content?: string };
    if (r.output) return r.output;
    if (r.answer) return r.answer;
    if (r.content) return r.content;
  }

  // 5) 最後の手段：JSON
  try {
    return JSON.stringify(result);
  } catch {
    return String(result);
  }
}

/**  */

/**
 * Message.content が string / MessageContent[]
 * どちらでも受け取れるよう正規化
 * @param content
 * @returns
 */
export function normalizeMessageContent(content: unknown): string {
  // string ならそのまま
  if (typeof content === "string") return content;

  // OpenAI/LC の MessageContent[]（マルチモーダル対応）
  if (Array.isArray(content)) {
    const parts = content as TYPE.MessageContentPart[];
    // text 系だけつなぐ（画像URLやtool_callはログに要らない想定）
    const texts = parts
      .map((p) => {
        if ("type" in p && p.type === "text" && typeof p.text === "string") {
          return p.text;
        }
        if (
          "type" in p &&
          p.type === "input_text" &&
          typeof p.text === "string"
        ) {
          return p.text;
        }
        return "";
      })
      .filter(Boolean);
    if (texts.length > 0) return texts.join("");
  }

  // それ以外は toString or JSON
  if (content?.toString && content.toString !== Object.prototype.toString) {
    try {
      const s = content.toString();
      if (s && s !== "[object Object]") return s;
    } catch {}
  }
  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}
