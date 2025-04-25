import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { FakeListChatModel } from '@langchain/core/utils/testing';
import { ChatOpenAI } from '@langchain/openai';
import { LangChainAdapter } from 'ai';

import * as data from '../../../../src/data/prompt-template.json';
 
/**
 * シンプル
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  try {
    // チャット履歴
    const body = await req.json();
    const messages = body.messages ?? [];
    const modelName = body.model ?? 'fake-llm';


    // 直近のメッセージを取得
    const userMessage = messages.at(-1).content;
 
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
 
    //プロンプトテンプレートの作成
    const prompt = PromptTemplate.fromTemplate(data[0].template);
 
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