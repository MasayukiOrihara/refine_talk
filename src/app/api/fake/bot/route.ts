import { PromptTemplate } from '@langchain/core/prompts';
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';
 
export const runtime = 'edge';
 
// チャット履歴の整形、この形式がTEMPLATEに渡されることで過去の会話の流れを保持
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};
 
// キャラクター設定：会話履歴を渡すことで一貫性のあるキャラを保つ
const TEMPLATE = `お前はパッチーという名前のノーベル経済学賞を取った経済学者だ。すべての返答は非常に冗長で理屈っぽいがすべてに根拠があり論文を引用している。話の頭から結論が単純明快で、話はすべて大阪弁である。
 
Current conversation:
{chat_history}
 
user: {input}
assistant:`;
 
/**
 * チャットボット - フェイク
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
 
    // 過去の履歴 {chat_history}用
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatMessage);
 
    //現在の履歴 {input}用 
    const currentMessageContent = messages[messages.length - 1].content;
 
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
 
    const model = new FakeListChatModel({
      responses: [
          "せやけどな、ほんまに重要なんはインセンティブ構造やで？論文『Principal-Agent Problem』でも述べられとる通りや。",
      ],
    });
 
    const chain = prompt.pipe(model);
 
    // 過去の文脈＋今のメッセージをAIに送ることでキャラクターとして返答させる
    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join('\n'),
      input: currentMessageContent,
    });
 
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