import { PromptTemplateJson } from '@/contents/type';
import { isObject, loadJsonFile } from '@/contents/utils';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { Annotation, messagesStateReducer, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';


// モデルのセット（OPENAI固定）
const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o", temperature: 0.3 });
// プロンプトの読み込み
const template = await loadJsonFile<PromptTemplateJson[]>('src/data/prompt-template.json');
// プロンプトチェック用関数
function createErrorResponse(message: string, statusCode: number = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}
// チャット形式
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};
// フラグ状態の保持
let isStartedState = false;
let isTargetState = false;
let isReasonState = false;
let checkTargetState = false;
let checkReasonState = false;



/** 初めの状態変更ノード */
async function setState({ messages }: typeof StateAnnotation.State) {
  console.log("setState");

  // 現在の状態
  return {
    isStarted: isStartedState,
    isTarget: isTargetState,
    isReason: isReasonState,
    checkTarget: checkTargetState,
    checkReason: checkReasonState
  }
}

/** 報連相ワークは始まっているかの状態確認ノード */
async function isProcessStarted({ messages, isStarted }: typeof StateAnnotation.State) {
  console.log("isProcessStarted: " + isStarted);

  isStartedState = true;
}

/** 開発の仕事を想像させるノード */
async function explainEngineeringTopics({ messages }: typeof StateAnnotation.State) {
  console.log("explainEngineeringTopics");

  // AIに開発についての話をさせる
  return {
    messages: [...messages, new AIMessage("あなたは講師です。開発の仕事について語ってください。\n")],
  };
}

/** 1つ目の問題「誰のため」は正解したかの状態確認ノード */
async function checkTargetMatch({ messages }: typeof StateAnnotation.State) {
  console.log("checkTargetMatch");
}

/** 1つ目の問題「誰のため」を聞くノード */
async function questionTarget({ messages }: typeof StateAnnotation.State) {
  console.log("questionTarget");

  // 問題を出してもらう
  messages[messages.length -1].content += "上記について話したのち、下記の質問をしてください。\n[開発の仕事を想定し、報連相は誰のためのものか]";
  return {
    messages: [...messages]
  };
}

/** 1つ目の問題「誰のため」ヒントノード */
async function giveTargetHint({ messages }: typeof StateAnnotation.State) {
  console.log("giveTargetHint");

  // 答えに対してヒントを与える
  return {
    messages: [...messages, new AIMessage("ユーザーは答えを外したのであなたはユーザーを諫め、[ヒント]をあげてください。\n")],
  };
}

/** 1つ目の問題「誰のため」をクリアしたか状態確認ノード */
async function isTargetCleared({ messages }: typeof StateAnnotation.State) {
  console.log("isTargetCleared");
}

/** 2つ目の問題「なぜリーダーのためなのか」は正解したかの状態確認ノード */
async function checkReasonMatch({ messages }: typeof StateAnnotation.State) {
  console.log("checkReasonMatch");
}

/** 2つ目の問題「なぜリーダーのためなのか」を聞くノード */
async function questionReason({ messages }: typeof StateAnnotation.State) {
  console.log("questionReason");
}

/** 2つ目の問題「なぜリーダーのためなのか」ヒントノード */
async function giveReasonHint({ messages }: typeof StateAnnotation.State) {
  console.log("giveReasonHint");
}

/** 2つ目の問題「なぜリーダーのためなのか」をクリアしたか状態確認ノード */
async function isReasonCleared({ messages }: typeof StateAnnotation.State) {
  console.log("isReasonCleared");
}

/** なぜ報連相が必要になるのかを解説するノード */
async function explainNewsletter({ messages }: typeof StateAnnotation.State) {
  console.log("explainNewsletter");
}

/** 終了前のノード */
async function exit({ messages }: typeof StateAnnotation.State) {
  console.log("exit");
}

/** 結果を保存して終了ノード */
async function isProcessEnd({ messages }: typeof StateAnnotation.State) {
  console.log("isProccessEnd");
}

/**
 * グラフ定義
 * messages: 今までのメッセージを保存しているもの
 */
export const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
    isStarted: Annotation<boolean>({
      value: (state: boolean = false, action: boolean) => action,
    }),
    isTarget: Annotation<boolean>({
      value: (state: boolean = false, action: boolean) => action,
    }),
    isReason: Annotation<boolean>({
      value: (state: boolean = false, action: boolean) => action,
    }),
    checkTarget: Annotation<boolean>({
      value: (state: boolean = false, action: boolean) => action,
    }),
    checkReason: Annotation<boolean>({
      value: (state: boolean = false, action: boolean) => action,
    }),
});

const graph = new StateGraph(StateAnnotation)
  .addNode("set", setState)
  .addNode("is1", isProcessStarted)
  .addNode("is2", isTargetCleared)
  .addNode("is3", isReasonCleared)
  .addNode("is4", isProcessEnd)
  .addNode("check1", checkTargetMatch)
  .addNode("check2", checkReasonMatch)
  .addNode("exit", exit)
  .addNode("explainStart", explainEngineeringTopics)
  .addNode("explainEnd", explainNewsletter)
  .addNode("question1", questionTarget)
  .addNode("question2", questionReason)
  .addNode("hint1", giveTargetHint)
  .addNode("hint2", giveReasonHint)

  .addEdge("__start__", "set")
  .addEdge("set", "is1")
  .addConditionalEdges("is1", (state) => state.isStarted ? "check1" : "explainStart")
  .addEdge("explainStart", "question1")
  .addEdge("question1", "exit")
  .addConditionalEdges("check1", (state) => state.checkTarget ? "is2" : "hint1")
  .addEdge("hint1", "question1")
  .addConditionalEdges("is2", (state) => state.checkReason ? "check2" : "question2")
  .addEdge("question2", "exit")
  .addConditionalEdges("check2", (state) => state.checkTarget ? "is3" : "hint2")
  .addConditionalEdges("is3", (state) => state.checkTarget ? "is4" : "explainEnd")
  .addEdge("explainEnd", "exit")
  .addEdge("is4", "exit")
  .addEdge("exit", "__end__")
  .compile();



/**
 * 報連相ワークAI
 * 
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  try{
    const body = await req.json();
    const messages = body.messages ?? [];

    // 過去の履歴
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
    // 直近のメッセージを取得
    const userMessage = messages.at(-1).content;
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // langgraph
    const result = await graph.invoke({
      messages: [new HumanMessage(userMessage)],
    });

    console.log("langgraph: " + result.messages[1].content);
        
    // テンプレートチェック
        if (!template.success) return createErrorResponse(template.error);
        const found = template.data.find(obj => isObject(obj) && obj['name'] === 'api-prot2-question-graph');
        if (!found) throw new Error('テンプレートが見つかりませんでした');
    
        // ストリーミング応答を取得
        const prompt = PromptTemplate.fromTemplate(found.template);
        const chain = prompt.pipe(model);
        const stream = await chain.stream({ 
          userMessage: userMessage,
          aiMessage: result.messages[1].content,
          chatHistory: formattedPreviousMessages
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