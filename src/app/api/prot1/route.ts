import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from "@langchain/anthropic";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';
 
export const runtime = 'edge';
 
// チャットの整形、この形式でチャットを行う
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};
 
// プロンプト1: 指摘ポイント抽出
  const TEMPLATE1 = `以下の部下からの口頭報告で、ビジネスマナーに引っかかる点を1行で指摘してください。 
  
  user: {input}
  assistant:`;

// プロンプト2: キャラクター設定 + 指示 + 今までのチャット履歴 + 送るメッセージと形式
const TEMPLATE2 = `あなたは折原という名前の男性でアラサー社会人です。意欲の特徴として、モチベーションが他者評価や自分の価値観に極端に影響される事は少ないです。また、変化の多い少ないに関わらず、どんな環境においても、安定的に力を発揮できます。ストレスに対する感情面の傾向として、自分が精神的に辛い状況でも、周りへの影響を考えた感情表現ができますが、ストレスを溜めてしまうことがあります。リーダーシップの特徴としては、合理的に問題解決を目指すよりも、まずはメンバーの気持ちに配慮することを優先するタイプです。問題発生時の傾向として、自責の感情とは切り離して客観的に問題の原因の所在を把握しようとします。そして、問題解決にあたっては、独力で解決しようとする傾向があります。
あなたは会社で後輩から報告を受ける立場です。今日の予定の報告を聞いて指摘ポイントに沿って3行で指摘してください。 
 
Current conversation:
{chat_history}
 
user: {input}
指摘ポイント：{prompt1_output}
assistant:`;
 
/**
 * チャットボット
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const modelName = body.model ?? 'fake-llm';
 
    // 過去の履歴 {chat_history}用
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatMessage);
 
    //現在の履歴 {input}用 
    const currentMessageContent = messages[messages.length - 1].content;
 
    // プロンプトの準備
    const prompt1 = PromptTemplate.fromTemplate(TEMPLATE1);
    const prompt2 = PromptTemplate.fromTemplate(TEMPLATE2);
 
    // モデルの指定
    let model;
    switch (modelName) {
      case 'gpt-4o':
        model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'gpt-4o',
        temperature: 0.6, // ランダム度（高いほど創造的）
        });
      break;
      case 'claude-haiku':
        model = new ChatAnthropic({
          model: 'claude-3-5-haiku-20241022',
        });
      break;
      default:
        model = new FakeListChatModel({
          responses: [
            "（応答結果）",
          ],
        });
    }

    // プロンプトとモデルをつなぐ
    const chain1 = prompt1.pipe(model);
    const chain2 = prompt2.pipe(model);

    // １回目の質問
    const output = await chain1.invoke({
      input: currentMessageContent,
    });
 
    // ２回目の質問
    const stream = await chain2.stream({
      chat_history: formattedPreviousMessages.join('\n'),
      input: currentMessageContent,
      prompt1_output: output.content,
    });

    // プロンプト2の確認
    const finalPrompt2 = await prompt2.format({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
      prompt1_output: output.content,
    });
    
    console.log(output.content);
    console.log(finalPrompt2);
 
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
 
    return new Response(
      JSON.stringify({ error: 'Unknown error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}