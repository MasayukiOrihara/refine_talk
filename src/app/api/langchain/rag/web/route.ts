import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { FakeListChatModel } from '@langchain/core/utils/testing';
import { ChatOpenAI, OpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { RunnableSequence } from '@langchain/core/runnables';
 
// チャット形式
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

// テンプレート
const TEMPLATE = `3行にまとめて回答してください。
Current conversation:
{chat_history}
 
user: {context}
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

    /**
     * RAGを試す
     * tavilyでのweb検索
     */
    // Tavilyツールの準備
  const tavily = new TavilySearchAPIRetriever({
    apiKey: process.env.TAVILY_API_KEY,
    k: 5,
    includeGeneratedAnswer: true,
  });


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
        model: 'gpt-4o-mini',
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
        
    // const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    const chain = RunnableSequence.from([
      async ({history, input}: {history: string; input:string}) => {
        const docs = await tavily.invoke(input);
        const context = docs.map((d: any) => d.pageContent).join("\n---\n");
        const chat_history = history;
        return `3行にまとめて回答してください。
          Current conversation:
          ${chat_history}
 
          情報: ${context}
          これらの情報をもとにユーザーに答えてください。

          質問: ${input}
          `;
      },
      (prompt: string) => model.invoke(prompt),
    ]);


    const stream = await chain.stream({
      history: formattedPreviousMessages, 
      input: currentMessageContent
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