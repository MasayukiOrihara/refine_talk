import { PromptTemplateJson } from "@/contents/type";
import { getModel, isObject, loadJsonFile } from "@/contents/utils";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { DynamicTool } from "@langchain/core/tools";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { LangChainAdapter } from "ai";


/**
 * もし調べ物が必要ならそれに応じてwebから取得する
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  try {
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


    /**
     * この辺から
     */
    // Tavily Retriever を初期化
    const tavilyRetriever = new TavilySearchAPIRetriever({
      apiKey: process.env.TAVILY_API_KEY,
      k: 3,
      includeGeneratedAnswer: true
    });
    // tool にラップ
    const tavilyTool = new DynamicTool({
      name: "tavily_search",
      description: "Search the web using Tavily API",
      func: async (input: string) => {
        const docs = await tavilyRetriever.invoke(input);
        return docs.map((doc) => doc.pageContent).join("\n\n");
      },
    });

    // モデルの定義
    const model = getModel(modelName).bindTools?([tavilyTool]);
    const agent = createReactAgent(model);
 
    //プロンプトテンプレートの作成
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
 
    // パイプ処理
    const chain = prompt.pipe(model);

    // チャット結果の取得
    const result= await agent.call([new HumanMessage(userMessage)])

    // ストリーミング応答を取得
    const stream = await chain.stream({ message: result });

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