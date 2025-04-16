import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { LangChainAdapter } from 'ai';
 
// 軽量・高速なEdge Function
export const runtime = 'edge';
 
/**
 * 橋本さん制作AIチャットハンズオンカリキュラム
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  try {
    // チャット履歴
    const { messages } = await req.json();
    // 直近のメッセージを取得
    const userMessage = messages.at(-1).content;
 
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
 
    // プロンプトテンプレートの作成（そのままuserMessageをLLMに渡す）
    const prompt = PromptTemplate.fromTemplate('{message}');
 
    // モデルの指定
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o',
      temperature: 0.8, // ランダム度（高いほど創造的）
    });
 
    // パイプ処理
    const chain = prompt.pipe(model);
 
    // ストリーミング応答を取得
    const stream = await chain.stream({ message: userMessage });
 
    // LangChainのストリーム出力を Webレスポンス用のストリーム形式に変換する
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