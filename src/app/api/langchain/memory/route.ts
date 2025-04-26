import { PromptTemplate } from '@langchain/core/prompts';

import { getModel, isObject, loadJsonFile, wrapStreamWithSave } from '@/contents/utils';
import { MessageJson, PromptTemplateJson } from '@/contents/type';


/**
 * 会話の外部保存機能
 * 【　4月末リファクタリング済み　】
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  try {
    // チャット履歴と選択したモデル
    const [messages, modelName] = await req.json().then(body => [
      body.messages ?? [], 
      body.model ?? 'fake-llm'
    ]);

    // 直近のメッセージを取得
    const userMessage = messages.at(-1).content;
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    //　会話記憶の読み込み
    const memory = await loadJsonFile<MessageJson[]>('src/data/message-memory.json');
    if (!memory.success) {
      return new Response(JSON.stringify({ error: memory.error }),{
        status: 500,
        headers: { 'Content-type' : 'application/json' },
      });
    }

    //　プロンプトテンプレート読み込み
    const template = await loadJsonFile<PromptTemplateJson[]>('src/data/prompt-template.json');
    if (!template.success) {
      return new Response(JSON.stringify({ error: template.error }),{
        status: 500,
        headers: { 'Content-type' : 'application/json' },
      });
    }

    // プロンプトテンプレートの抽出
    const found = template.data.find(obj => isObject(obj) && obj['name'] === 'api-langchain');
    if (!found) {
      throw new Error('テンプレートが見つかりませんでした');
    }

    // プロンプトの設定 
    const prompt = PromptTemplate.fromTemplate(found.template);
  
    // モデルの指定
    const model = getModel(modelName);
 
    // パイプ処理
    const chain = prompt.pipe(model);
 
    // ストリーミング応答を取得
    const stream = await chain.stream({ message: userMessage });
    
    // 全文保存とストリーミングの同時実行
    const wrappedStream = await wrapStreamWithSave(userMessage, stream, 'src/data/memory-output.json');
 
    // LangChainのストリーム出力を Webレスポンス用のストリーム形式に変換する
    return new Response(wrappedStream, {
      headers: { 'Content-Type': 'application/json' },
    });
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