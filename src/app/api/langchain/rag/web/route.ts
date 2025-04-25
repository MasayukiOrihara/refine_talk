import { ChatAnthropic } from '@langchain/anthropic';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { FakeListChatModel } from '@langchain/core/utils/testing';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { RunnableSequence } from '@langchain/core/runnables';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from "@langchain/pinecone";


// チャット形式
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

/** AstraDBの準備 */
// const {ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT} = process.env;
// if (!ASTRA_DB_APPLICATION_TOKEN || !ASTRA_DB_API_ENDPOINT) {
//   throw new Error("Astra DB の環境変数が未設定です。");
// }
// const astraConfig = {
//   token: ASTRA_DB_APPLICATION_TOKEN,
//   endpoint: ASTRA_DB_API_ENDPOINT,
//   collection: "web_4",
//   skipCollectionProvisioning: false,
// };

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
       // async ({history, input}: {history: string; input:string}) => {
      async (input: string) => {
        // 記事の取得
        const docs = await tavily.invoke(input);

        // 記事の分割
        const splitDocs = await splitter.splitDocuments(docs);
        console.log("分割数: " + splitDocs.length);

        // 分割して保存
        // const vectorStore = await MemoryVectorStore.fromDocuments(
        //   splitDocs,
        //   embeddings
        // );


      //   try {
      //     vectorStore = await FaissStore.fromDocuments(
      //       splitDocs,
      //       embeddings
      //     );
      //await vectorStore.save("src/data");
      // } catch (e) {
      //   console.log(e);
      // }

      // 追加したいテスト文書
// const docsTest = [
//   new Document({
//     pageContent: "This is the first test document.",
//     metadata: { source: "test1" },
//   }),
//   new Document({
//     pageContent: "Another example for vector storage.",
//     metadata: { source: "test2" },
//   }),
// ];


      //console.log(astraConfig);
     // console.log(splitDocs);
        // DBへ接続
        // let vectorStore = await AstraDBVectorStore.fromDocuments(
        //   docsTest,
        //   embeddings,
        //   astraConfig
        // );
        // await vectorStore.addDocuments(docsTest);
      
          

        // HNSWLibを試す
        // const indexPath = "./hnsw_index";
        // // 初回作成＆保存
        // let vectorStore = null;
        // try {
        //   vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
        //   await vectorStore.save(indexPath); // 保存される
        // } catch (e){
        //   console.log(e);
        // }


        // pineconeを試す

        // Pinecone の初期化
        const pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY!
        });

        // インデックスを取得
        const index = pinecone.index(process.env.PINECONE_INDEX!);

        // Retriever を用いて、Vectore Store から検索し返答
        //const retriever = vectorStore.asRetriever({ k: 2 });
        // const response = await retriever.invoke(input);

        // PineconeStore を作成し、ドキュメントを追加
        const vectorStore = await PineconeStore.fromDocuments(splitDocs, embeddings, {
          pineconeIndex: index,
          namespace: "default", // 必要に応じて名前空間を設定
        });
        
        // vectore storeからinputで検索
        const response = await vectorStore.similaritySearchWithScore(input, 2);
        
        // 抽出
        const context = response.map(([doc, score]) => ({
          content: doc.pageContent,
          score: score,
        }));
        const data = context.map(item => item.content);
        
        console.log(response);
        // console.log(JSON.stringify(context));

        // const chat_history = history;
        // Current conversation: ${chat_history}
        return `3行にまとめて回答してください。

          情報: ${data}
          これらの情報をもとにユーザーに答えてください。

          質問: ${input}
          `;
      },
      (prompt: string) => model.invoke(prompt),
    ]);


    const stream = await chain.stream(currentMessageContent);

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