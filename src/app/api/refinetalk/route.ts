import { PromptTemplate } from "@langchain/core/prompts";
import { LangChainAdapter } from "ai";
import { client, Haike3_5, outputParser } from "@/lib/models";
import { MARKDOWN_NAME } from "@/lib/constants";
import { cutKeyword, formatMessage } from "@/lib/utils";

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

    // プロンプトとモデルをつなぐ
    const firstChain = scorePrompt.pipe(Haike3_5).pipe(outputParser);
    const secondChain = characterPrompt.pipe(Haike3_5).pipe(outputParser);

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
