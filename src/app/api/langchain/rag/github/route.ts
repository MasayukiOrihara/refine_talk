import { ChatAnthropic } from '@langchain/anthropic';
import { PromptTemplate } from '@langchain/core/prompts';
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { FakeListChatModel } from '@langchain/core/utils/testing';
import { ChatOpenAI, OpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';
 
// チャット形式
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

// テンプレート
const TEMPLATE = `3行にまとめて回答してください。
Current conversation:
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

    /**
     * RAGを試す
     */
    // document Loaderを用いてデータを読み込む
    console.log("Load GitHub Repository");
    const loader = new GithubRepoLoader(
      "https://github.com/langchain-ai/langchain", 
      {
        branch: "master",
        recursive: true,
        accessToken: process.env.GITHUB_TOKEN,
        unknown: "warn",
      ignoreFiles: [/^(?!.*\.(js|ts)$).*$/],
      }
    );
    const docs = await loader.load();

    // ドキュメントを分割 & ベクトル化
    console.log("Split & Embed Documents");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 0,
    });
    const splitDocs = await splitter.splitDocuments(docs);
    
    const embeddings = new OpenAIEmbeddings({apiKey: process.env.OPENAI_API_KEY});
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );


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
        
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    const chain = prompt.pipe(model);

    // Retriever を用いて、Vectore Store から検索し返答
    const retriever = vectorStore.asRetriever({ k: 3 });

    // チェーン構築
    // const qaChain = RunnableSequence.from([
    //   async (input: string) => {
    //     const docs = await retriever.getRelevantDocuments(input);
    //     console.log(docs);
    //     const context = docs.map((d) => d.pageContent).join("\n\n");
    //     return `以下の文脈に基づいて質問に答えてください:\n\n${context}\n\n質問: ${input}`;
    //   },
    //   (prompt) => model.invoke(prompt),
    // ])

    

    const question = "AWSのS3からデータを読み込むためのDocument loaderはありますか？";
    const response = await retriever.invoke(question);

    console.log("🧠 回答:", response);


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