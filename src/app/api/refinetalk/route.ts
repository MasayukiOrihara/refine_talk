import { PromptTemplate } from "@langchain/core/prompts";
import { toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";

import { client, outputParser } from "@/lib/llm/models";
import { MARKDOWN_NAME } from "@/lib/constants";
import { cutKeyword } from "@/lib/utils";
import { formatMessage, messageText } from "@/lib/llm/message";
import { runWithFallback } from "@/lib/llm/run/fallback";

import * as ERR from "@/lib/messages/error";

/** 定数 */
const KEYWORD_SCORE = "総合点: ";
const KEYWORD_POINT = "指摘ポイント: ";

/**
 * RefineTalk API
 * 報告に対するビジネスマナーの指摘
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    // チャットデータの取得
    const body = await req.json();
    // フロントから今までのメッセージを取得
    const messages: UIMessage[] = body.messages ?? [];
    // ページ数とsession idの取得
    const file: string = body?.file;
    const sessionId: string = body?.sessionId;
    console.log(sessionId);
    console.log(file);
    if (!file || !sessionId) {
      throw new Error(`${ERR.VALUE_ERROR}: file or session id`);
    }

    console.log("🧠 refine talk api...");

    // 過去の履歴 {chat_history}用
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    //現在の履歴 {input}用
    const currentMessage = messages[messages.length - 1];
    const input = messageText(currentMessage);

    // langsmithからプロンプトの取得
    // todo: ローカル取得に変更（プロンプトの取り扱いに関してはまた後日）
    const [characterTemplate, scoreTemplate] = await Promise.all([
      client.pullPromptCommit("refine-talk-character"),
      client.pullPromptCommit("refine-talk-scere"),
    ]);

    console.log("1⃣  点数の取得中...");
    // プロンプトの取得
    const scorePrompt = PromptTemplate.fromTemplate(
      scoreTemplate.manifest.kwargs.template
    );
    const scorePromptVariables = {
      input: input,
    };
    // LLM 応答
    const scoreRes = (await runWithFallback(scorePrompt, scorePromptVariables, {
      mode: "invoke",
      parser: outputParser,
      label: "refine talk 1 invoke",
      sessionId: sessionId,
    })) as string;

    console.log("score: " + scoreRes);

    // 文字列の切り出し
    const score = cutKeyword(scoreRes, KEYWORD_SCORE);
    const checkPoint = cutKeyword(score, KEYWORD_POINT);

    console.log("2⃣  評価の取得中...");
    // プロンプトの取得
    const characterPrompt = PromptTemplate.fromTemplate(
      characterTemplate.manifest.kwargs.template
    );
    const promptVariables = {
      history: formattedPreviousMessages.join("\n"),
      question: MARKDOWN_NAME[0],
      input: input,
      score: score,
      prompt1_output: checkPoint,
    };
    // LLM 応答
    const lcStream = (await runWithFallback(characterPrompt, promptVariables, {
      mode: "stream",
      label: "refine talk 2 stream",
      sessionId: sessionId,
    })) as ReadableStream<string>;

    const response = createUIMessageStreamResponse({
      stream: toUIMessageStream(lcStream),
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : ERR.UNKNOWN_ERROR;

    console.error(`${ERR.REFINE_TALK_ERROR}: ${message}`);
    return Response.json({ error: message }, { status: 500 });
  }
}
