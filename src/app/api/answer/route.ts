import { PromptTemplate } from "@langchain/core/prompts";
import { toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";

import path from "path";
import * as fs from "fs";

import { Haike3_5, outputParser } from "@/lib/llm/models";
import { MARKDOWN_NAME } from "@/lib/constants";
import { FILE_NOT_FOUND } from "../../../lib/constants";
import * as ERR from "@/lib/messages/error";
import { ANSWER_PROMPT } from "@/lib/llm/prompts";
import { messageText } from "@/lib/llm/message";
import { SCENARIO_PATH } from "@/lib/contents/scenarios";
import { MarkdownInfo } from "@/lib/schema";
import { requestApi } from "@/lib/api/request/request";
import { MARKDOWN_READ_API } from "@/lib/api/path";
import { runWithFallback } from "@/lib/llm/run/fallback";

/**
 * 解答例を取得する
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

    console.log("🧠 answer api...");

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

    /* === === 1. 模範解答 LLM === === */
    console.log("1⃣  模範解答の作成中...");
    // プロンプトの取得
    const prompt = PromptTemplate.fromTemplate(ANSWER_PROMPT);
    const promptVariables = {
      question: question,
      input: input,
    };
    // LLM 応答
    const lcStream = (await runWithFallback(prompt, promptVariables, {
      mode: "stream",
      label: "answer stream",
      sessionId: sessionId,
    })) as ReadableStream<string>;

    const response = createUIMessageStreamResponse({
      stream: toUIMessageStream(lcStream),
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : ERR.UNKNOWN_ERROR;

    console.error(`${ERR.ANSWER_ERROR}: ${message}`);
    return Response.json({ error: message }, { status: 500 });
  }
}
