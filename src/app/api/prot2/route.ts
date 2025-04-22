import { openai } from '@ai-sdk/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { FakeListChatModel } from '@langchain/core/utils/testing';
import { ChatOpenAI } from '@langchain/openai';
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';
 
// チャット形式
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

// テンプレート
const TEMPLATE = `Current conversation:
{chat_history}
 
user: {input}
assistant:`;

/**
 * チャット応答AI（記憶・モデル変更対応済み）
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  try{
    const body = await req.json();
    const messages = body.messages ?? [];
    const modelName = body.model ?? 'fake-llm';

    // 過去の履歴{chat_history}
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatMessage)

    // メッセージ{input}
    const currentMessageContent = messages[messages.length - 1].content;

    // モデルの指定
    let model;
    switch (modelName) {
      case 'gpt-4o':
        model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'gpt-4o',
        temperature: 0.9, // ランダム度（高いほど創造的）
        });
      break;
      case 'claude-haiku':
        model = new ChatAnthropic({
          model: 'claude-3-5-haiku-20241022',
          temperature: 0.9, // ランダム度（高いほど創造的）
        });
      break;
      default:
        model = new FakeListChatModel({
          responses: [
            "（応答結果）",
          ],
        });
    }
        
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    const chain = prompt.pipe(model);

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