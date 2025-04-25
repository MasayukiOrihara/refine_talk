import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { FakeListChatModel } from '@langchain/core/utils/testing';
import { ChatOpenAI } from '@langchain/openai';
import { LangChainAdapter } from 'ai';
import path from 'path';
import { readFile, writeFile } from 'fs/promises';


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

    // 過去メッセージの読み込み
    let memoryJson = [];
    const filePathMemory = path.join(process.cwd(), 'src/data/message-memory.json');
    try {
      const memoryData = await readFile(filePathMemory, 'utf-8');
      memoryJson = JSON.parse(memoryData);

      // 配列でない場合は配列として初期化
      if (!Array.isArray(memoryJson)) {
        console.log('既存のデータが配列ではありません。空の配列として初期化します。');
        memoryJson = [];
      }
    } catch (e){
      console.log(e);
    }

 
    //プロンプトテンプレートの作成
    let promptJson = null;
    try {
      const filePathPrompt = path.join(process.cwd(), 'src/data/prompt-template.json');
      const promptData = await readFile(filePathPrompt, 'utf-8');
      promptJson = JSON.parse(promptData);
    } catch(e){
      console.log(e);
    }
    
    const prompt = PromptTemplate.fromTemplate(promptJson[0].template);
 
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

    // すべて出力
    const finalCharacterPrompt = await chain.invoke({ message: userMessage });

    

    //書き出し
    try {
      const data = {
        input: userMessage,
        output: finalCharacterPrompt.content
      };

      memoryJson.push(data);
      await writeFile(filePathMemory, JSON.stringify(memoryJson, null, 2), 'utf-8');
      console.log('JSONに書き出しました');
    } catch (err) {
      console.error(err);
    }
 
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