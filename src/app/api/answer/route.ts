import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";

import path from "path";
import * as fs from "fs";

import { Haike3_5, outputParser } from "@/lib/models";
import { MARKDOWN_NAME } from "@/lib/constants";

/**
 * 解答例を取得する
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    // チャットデータの取得
    const body = await req.json();
    const messages = body.messages ?? [];
    const page = req.headers.get("page");

    console.log("🧠 AI 模範解答作成開始...");

    // ユーザー回答の取得
    const userAnswer = messages[messages.length - 1].content;
    console.log(userAnswer);

    // 問題文の取得
    let markdownPage = Number(page);
    if (isNaN(markdownPage)) {
      markdownPage = 0;
    }
    console.log("ページ数: " + markdownPage);

    const markdownPath = path.join(
      process.cwd(),
      "public",
      "markdowns",
      MARKDOWN_NAME[markdownPage]
    );
    if (!fs.existsSync(markdownPath)) {
      throw new Error(`ファイルが存在しません: ${markdownPath}`);
    }
    const content = fs.readFileSync(markdownPath, "utf-8");

    console.log("📃 プロンプトの取得開始...");
    const template =
      "以下はビジネスマナーに関する問題とそれに対するユーザーの回答です。ユーザーの回答に沿って模範解答を作成してください。出力は模範回答のみ出力してください。\n\n問題: \n{question}\n\nユーザーの回答: \n{user_answer}\n\n模範解答: ";
    const prompt = PromptTemplate.fromTemplate(template);
    const chain = prompt.pipe(Haike3_5).pipe(outputParser);

    console.log("📢 模範解答の出力...");

    // 出力
    const result = await chain.stream({
      question: content,
      user_answer: userAnswer,
    });

    return LangChainAdapter.toDataStreamResponse(result);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
