import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from "@langchain/anthropic";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { readFile } from 'fs/promises';
import path from 'path';
 
// チャット形式
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};
 
/**
 * チャットボット(折原AI)
 * 報告に対するビジネスマナーの指摘
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
 
    //プロンプトテンプレートの作成
    let json = null;
    try {
      const filePath = path.join(process.cwd(), 'src/data/prompt-template.json');
      const data = await readFile(filePath, 'utf-8');
      
      json = JSON.parse(data);
    } catch(e){
      console.log(e);
    }

    // プロンプトの準備
    const pointingOutPrompt = PromptTemplate.fromTemplate(json[1].template);
    const characterPrompt = PromptTemplate.fromTemplate(json[2].template);

    // 出力形式の指定
    const outputParser = new StringOutputParser();
 
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