import { Runnable } from "@langchain/core/runnables";

/**
 * Stream結果とInvoke結果のユニオン型
 */
export type LLMResponse = LLMParserResult | AsyncIterable<StreamChunk>;

/**
 * LLM結果の基本型を定義
 */
export type LLMParserResult = string | string[];

/**
 * ストリームのチャンクを扱うインターフェース
 */
export interface StreamChunk {
  content?: string;
  additional_kwargs?: Record<string, unknown>;
}

/**
 * runWithFallback のオプション引数型
 */
export type RunWithFallbackOptions = {
  mode?: "invoke" | "stream";
  parser?: Runnable;
  maxRetries?: number;
  baseDelay?: number;
  label?: string;
  sessionId?: string;
  onStreamEnd?: (response: string) => Promise<void>;
};

/** 使用量  */
export type Usage = { prompt: number; completion: number; total?: number };

/** 呼び出し時間測定用の拡張コールバック */
export type LatencyMetrics = {
  label: string;
  startedAt: number;
  finishedAt?: number;
  firstTokenMs?: number;
  totalMs?: number;
};

/**
 * LLM の呼び出し終了時呼ぶ型
 */
export type LLMEndPayload = {
  llmOutput?: { tokenUsage?: TokenUsage };
  usage?: TokenUsage;
  response?: { usage?: TokenUsage };
};

/**
 * トークンに関する情報をまとめた型
 */
type TokenUsage = {
  promptTokens?: number;
  prompt_tokens?: number;
  input_tokens?: number;
  completionTokens?: number;
  completion_tokens?: number;
  output_tokens?: number;
  totalTokens?: number;
  total_tokens?: number;
};

/**
 * DB に保存するデータをまとめた型
 */
export type LLMPayload = {
  label: string;
  llmName: string;
  metrics?: LatencyMetrics;
  sessionId: string;
  fullPrompt: string;
  usage?: Usage;
};

export type MessageContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: string | { url: string } }
  | { type: "input_text"; text: string }
  | { type: "tool_call"; id?: string; name?: string; args?: unknown }
  | Record<string, unknown>; // その他将来拡張
