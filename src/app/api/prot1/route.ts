import { PromptTemplate } from '@langchain/core/prompts';
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { getModel, isObject, loadJsonFile } from '@/contents/utils';
import { PromptTemplateJson } from '@/contents/type';
 
// チャット形式
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};
 
/**
 * チャットボット(折原AI)
 * 報告に対するビジネスマナーの指摘
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
 
    // 過去の履歴 {chat_history}用
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatMessage);
    //現在の履歴 {input}用 
    const currentMessageContent = messages[messages.length - 1].content;
 
    //プロンプトテンプレートの作成
    const template = await loadJsonFile<PromptTemplateJson[]>('src/data/prompt-template.json');
    if (!template.success) {
      return new Response(JSON.stringify({ error: template.error }),{
        status: 500,
        headers: { 'Content-type' : 'application/json' },
      });
    }
    // プロンプトテンプレートの抽出
    const foundPoint = template.data.find(obj => isObject(obj) && obj['name'] === 'api-prot1-point');
    const foundCharacter = template.data.find(obj => isObject(obj) && obj['name'] === 'api-prot1-character');
    if (!foundPoint || !foundCharacter) {
      throw new Error('テンプレートが見つかりませんでした');
    }
    // プロンプトの準備
    const pointingOutPrompt = PromptTemplate.fromTemplate(foundPoint.template);
    const characterPrompt = PromptTemplate.fromTemplate(foundCharacter.template);

    // 出力形式の指定
    const outputParser = new StringOutputParser();
 
    // モデルの指定
    const model = getModel(modelName);

    // プロンプトとモデルをつなぐ
    const chain1 = pointingOutPrompt.pipe(model).pipe(outputParser);
    const chain2 = characterPrompt.pipe(model).pipe(outputParser);

    // １回目の質問
    const output = await chain1.invoke({
      input: currentMessageContent,
    });
 
    // ２回目の質問
    const stream = await chain2.stream({
      chat_history: formattedPreviousMessages.join('\n'),
      input: currentMessageContent,
      prompt1_output: output,
    });

    // プロンプト2の確認
    const finalCharacterPrompt = await characterPrompt.format({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
      prompt1_output: output,
    });
    
    console.log(output);
    console.log(finalCharacterPrompt);
 
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