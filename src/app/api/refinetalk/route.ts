import { PromptTemplate } from "@langchain/core/prompts";
import { Message as VercelChatMessage, LangChainAdapter } from "ai";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { cutKeyword, isObject, loadJsonFile } from "@/contents/utils";
import { PromptTemplateJson } from "@/contents/type";
import { ChatAnthropic } from "@langchain/anthropic";

// チャット形式
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

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

    // 過去の履歴 {chat_history}用
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    //現在の履歴 {input}用
    const currentMessageContent = messages[messages.length - 1].content;

    // //プロンプトテンプレートの作成
    // const template = await loadJsonFile<PromptTemplateJson[]>(
    //   "src/data/prompt-template.json"
    // );
    // if (!template.success) {
    //   return new Response(JSON.stringify({ error: template.error }), {
    //     status: 500,
    //     headers: { "Content-type": "application/json" },
    //   });
    // }
    // // プロンプトテンプレートの抽出
    // const foundCharacter = template.data.find(
    //   (obj) => isObject(obj) && obj["name"] === "api-prot1-character"
    // );
    // const foundScore = template.data.find(
    //   (obj) => isObject(obj) && obj["name"] === "api-prot1-score-and-point"
    // );
    // if (!foundCharacter || !foundScore) {
    //   throw new Error("テンプレートが見つかりませんでした");
    // }
    // プロンプトの準備
    // const characterPrompt = PromptTemplate.fromTemplate(
    //   foundCharacter.template
    // );
    // const scorePrompt = PromptTemplate.fromTemplate(foundScore.template);

    /** 一時しのぎ（プロンプトのべた書き） */
    const CHARACTER_PROMPT = `あなたは感情に流されず安定した力を発揮するタイプで、共感重視のリーダー。問題には客観的かつ独力で向き合う傾向があります。現在は会社で後輩から報告を受ける立場です。今日の予定の[報告]を聞いて、[点数]を伝え、[指摘ポイント]に沿って3行程度の説明文としてコメントをください。\n\n---\nformat:\n点数: xx点\n\n指摘コメント: \n---\n\nCurrent conversation:\n{chat_history}\n\n[報告]: {input}\n[点数]: {score}\n[指摘ポイント]: {prompt1_output}\n\n答え: `;
    const SCORE_PROMPT = `以下の業務報告文を、ビジネスマナー教育における文書評価基準に従って採点してください。評価項目は次の4つで、各25点満点、合計100点満点です。 \n\n1. 情報の明確さ：報告の内容が正確・具体的に伝わっているか \n2. 文章の構成・読みやすさ：文の流れや句読点など、読み手にとって理解しやすいか \n3. 業務上の有用性：内容が判断・行動に役立つ情報になっているか \n4. 文体・トーンの適切さ：社内文書として適切な丁寧さ・表現が保たれているか \n\n各項目について以下のフォーマットで点数のみ記述してください。\nformat:\n---\n1. xx点 | 2. xx点 | 3. XX点 | 4. xx点\n総合点: xx点\n---\n\n報告:\n---\n{input}\n---\n\n答え: `;

    const characterPrompt = PromptTemplate.fromTemplate(CHARACTER_PROMPT);
    const scorePrompt = PromptTemplate.fromTemplate(SCORE_PROMPT);

    // 出力形式の指定
    const outputParser = new StringOutputParser();

    // モデルの指定
    const model = new ChatAnthropic({
      model: "claude-3-5-haiku-latest",
      temperature: 0.3,
    });

    // プロンプトとモデルをつなぐ
    const firstChain = scorePrompt.pipe(model).pipe(outputParser);
    const secondChain = characterPrompt.pipe(model).pipe(outputParser);

    // 1回目の質問
    const getScore = await firstChain.invoke({
      input: currentMessageContent,
    });
    console.log("score: " + getScore);

    // 文字列の切り出し
    const score = cutKeyword(getScore, "総合点: ");
    const checkPoint = cutKeyword(score, "指摘ポイント: ");

    // 2回目の質問
    const stream = await secondChain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
      score: score,
      prompt1_output: checkPoint,
    });

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    if (error instanceof Error) {
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
