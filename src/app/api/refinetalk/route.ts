import { PromptTemplate } from "@langchain/core/prompts";
import { Message as VercelChatMessage, LangChainAdapter } from "ai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatAnthropic } from "@langchain/anthropic";
import { Client } from "langsmith";

import { cutKeyword } from "@/contents/utils";

const client = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
});

const model = new ChatAnthropic({
  model: "claude-3-5-haiku-latest",
  apiKey: process.env.ANTHROPIC_API_KEY,
  tags: ["refinetalk"],
  temperature: 0.3,
});

const MARKDOWN_NAME = [
  "q1_morning-meeting.md",
  "q2_group-info.md",
  "q3_slide-review.md",
  "q4_meeting-report.md",
  "q5_phone-call.md",
  "q6_email-report.md",
];

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
    const messages = body.messages ?? [];
    const page = req.headers.get("page");

    console.log("🧠 AI 評価開始...");

    // チャット形式
    const formatMessage = (message: VercelChatMessage) => {
      return `${message.role}: ${message.content}`;
    };

    // 過去の履歴 {chat_history}用
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    //現在の履歴 {input}用
    const currentMessageContent = messages[messages.length - 1].content;

    // page数の取得
    let markdownPage = Number(page);
    if (isNaN(markdownPage)) {
      markdownPage = 0;
    }
    console.log("ページ数: " + markdownPage);

    console.log("📃 プロンプトの取得開始...");
    // langsmithからプロンプトの取得
    const characterTemplate = await client.pullPromptCommit(
      "refine-talk-character"
    );
    const scoreTemplate = await client.pullPromptCommit("refine-talk-scere");

    // プロンプトの取得
    const characterPrompt = PromptTemplate.fromTemplate(
      characterTemplate.manifest.kwargs.template
    );
    const scorePrompt = PromptTemplate.fromTemplate(
      scoreTemplate.manifest.kwargs.template
    );

    // 出力形式の指定
    const outputParser = new StringOutputParser();

    // プロンプトとモデルをつなぐ
    const firstChain = scorePrompt.pipe(model).pipe(outputParser);
    const secondChain = characterPrompt.pipe(model).pipe(outputParser);

    console.log("1⃣  点数の取得中...");

    // 1回目の質問
    const getScore = await firstChain.invoke({
      input: currentMessageContent,
    });
    console.log("score: " + getScore);

    // 文字列の切り出し
    const score = cutKeyword(getScore, "総合点: ");
    const checkPoint = cutKeyword(score, "指摘ポイント: ");

    console.log("2⃣  評価の取得中...");

    // 2回目の質問
    const stream = await secondChain.stream({
      history: formattedPreviousMessages.join("\n"),
      question: MARKDOWN_NAME[markdownPage],
      input: currentMessageContent,
      score: score,
      prompt1_output: checkPoint,
    });

    return LangChainAdapter.toDataStreamResponse(stream);
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
