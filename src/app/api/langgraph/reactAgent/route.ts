import 'dotenv/config';
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { LangChainAdapter } from 'ai';
import { getModel, isObject, loadJsonFile } from '@/contents/utils';
import { PromptTemplateJson } from '@/contents/type';
import { PromptTemplate } from '@langchain/core/prompts';

// エージェントが使用するツールを定義
const agentTools = [new TavilySearchResults({ apiKey: process.env.TAVILY_API_KEY, maxResults: 3 })];
const agentModel = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, temperature: 0 });

// グラフ実行間で状態を保持するためにメモリを初期化します
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
const messages = body.messages ?? [];
const modelName = body.model ?? 'gpt-4o-mini';


// 使ってみる
const agentFinalState = await agent.invoke(
  { messages: [new HumanMessage("サンフランシスコの現在の天気はどうですか？")] },
  { configurable: { thread_id: "42" } },
);

console.log(
  agentFinalState.messages[agentFinalState.messages.length - 1].content,
);

const agentNextState = await agent.invoke(
  { messages: [new HumanMessage("ニューヨークはどうですか？")] },
  { configurable: { thread_id: "42" } },
);

console.log(
  agentNextState.messages[agentNextState.messages.length - 1].content,
);

// 直近のメッセージを取得
    const userMessage = messages.at(-1).content;
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
 
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
 
    // モデルの指定
    const model = getModel(modelName);
 
    // パイプ処理
    const chain = prompt.pipe(model);
 
    // ストリーミング応答を取得
    const stream = await chain.stream({ message: userMessage });

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

