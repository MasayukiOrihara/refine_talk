import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from '@langchain/openai';
import { LangChainAdapter } from 'ai';
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { RunnableSequence } from '@langchain/core/runnables';
import { getModel } from '@/contents/utils';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';


/**
 * チャット応答AI（記憶なし・モデル変更対応済み）
 * 質問に対してweb検索を行い、結果をvectolにして保存
 * 保存したベクトルデータから質問文に類似したテキストを抜き出し質問に答える
 * 
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

    // ドキュメントを分割 & ベクトル化
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });
  
    // 埋め込みモデル
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      apiKey: process.env.OPENAI_API_KEY
    });

    // メッセージ{input}
    const currentMessageContent = messages[messages.length - 1].content;
    const query = `${currentMessageContent} site:docs.oracle.com`;

    // モデルの指定
    const model = getModel(modelName);
        
    /** chainの基本形式？ */
    const chain = RunnableSequence.from([
      async (input: string) => {
        // 記事の取得
        const docs = await tavily.invoke(input);

        // 記事の分割
        const splitDocs = await splitter.splitDocuments(docs);
        console.log("分割数: " + splitDocs.length);

        const vectorStore = await MemoryVectorStore.fromDocuments(
              splitDocs,
              embeddings
            );
        
        // vectore storeからinputで検索
        const response = await vectorStore.similaritySearchWithScore(input, 2);
        
        // 抽出
        const context = response.map(([doc, score]) => ({
          content: doc.pageContent,
          score: score,
        }));
        const data = context.map(item => item.content);
        console.log(response);

        return `3行にまとめて回答してください。

          情報: ${data}
          これらの情報をもとにユーザーに答えてください。

          質問: ${input}
          `;
      },
      (prompt: string) => model.invoke(prompt),
    ]);

    // ストリーム指定はしてるけど
    const stream = await chain.stream(query);

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