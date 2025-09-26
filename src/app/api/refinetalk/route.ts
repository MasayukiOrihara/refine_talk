import { PromptTemplate } from "@langchain/core/prompts";
import { toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";

import { client, outputParser } from "@/lib/llm/models";
import { MARKDOWN_NAME } from "@/lib/constants";
import { cutKeyword } from "@/lib/utils";
import { formatMessage, messageText } from "@/lib/llm/message";
import { runWithFallback } from "@/lib/llm/run/fallback";

import * as ERR from "@/lib/messages/error";
import * as PRO from "@/lib/llm/prompts";
import { requestApi } from "@/lib/api/request/request";
import { MARKDOWN_READ_API } from "@/lib/api/path";
import { SCENARIO_PATH } from "@/lib/contents/scenarios";
import { MarkdownInfo } from "@/lib/schema";

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
    // urlの取得
    const url = new URL(req.url);
    if (!url) {
      throw new Error(`${ERR.VALUE_ERROR}: url`);
    }
    // ページとsession idの取得
    const file: string = body?.file;
    const sessionId: string = body?.sessionId;
    if (!file || !sessionId) {
      throw new Error(`${ERR.VALUE_ERROR}: file or session id`);
    }

    console.log("🧠 refine talk api...");

    // 過去の履歴 {chat_history}用
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    //現在の履歴 {input}用
    const currentMessage = messages[messages.length - 1];
    const input = messageText(currentMessage);
    // 問題内容の取得
    const dir = SCENARIO_PATH;
    const mdInfo: MarkdownInfo = { file, dir };
    const question: string = await requestApi(
      `${url.protocol}//${url.host}/`,
      MARKDOWN_READ_API,
      {
        method: "POST",
        body: { mdInfo },
      }
    );

    /* === === 1. 採点 LLM === === */
    console.log("1⃣  点数の取得中...");
    // プロンプトの取得
    const scorePrompt = PromptTemplate.fromTemplate(PRO.SCORE_RESULT_PROMPT);
    const scorePromptVariables = {
      question: question,
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
    const checkPoint = cutKeyword(scoreRes, KEYWORD_POINT);

    /* === === 2. 評価 LLM === === */
    console.log("2⃣  評価の取得中...");
    // プロンプトの取得
    const characterPrompt = PromptTemplate.fromTemplate(
      PRO.POINTING_OUT_PROMPT
    );
    const promptVariables = {
      character: PRO.CharacterTypes.calmListener.prompt,
      chat_history: formattedPreviousMessages.join("\n"),
      question: question,
      input: input,
      score: score,
      pointing_out: checkPoint,
    };
    // LLM 応答
    const lcStream = (await runWithFallback(characterPrompt, promptVariables, {
      mode: "stream",
      label: "refine talk 2 stream",
      sessionId: sessionId,
    })) as ReadableStream<string>;

    // ヘッダーで点数を送信
    const match = score.match(/\d+/); // 連続する数字だけ
    const num = match ? Number(match[0]) : null;
    const headers = new Headers({ "x-score": String(num) });

    const response = createUIMessageStreamResponse({
      stream: toUIMessageStream(lcStream),
      headers: headers,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : ERR.UNKNOWN_ERROR;

    console.error(`${ERR.REFINE_TALK_ERROR}: ${message}`);
    return Response.json({ error: message }, { status: 500 });
  }
}
