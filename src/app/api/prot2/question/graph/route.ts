import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { Annotation, messagesStateReducer, StateGraph, StateType } from "@langchain/langgraph";
import { MessagesAnnotation } from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { NextApiRequest, NextApiResponse } from 'next';
import { LangChainAdapter } from "ai";
import { z } from "zod";


const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o", temperature: 0.3 });
// とりあえず状態保存
let wantRiddleState = false;

/**
 * なぞなぞデータ
 */
const questions = [
  {
    pageContent: "パンはパンでも食べられないパンは？",
    metadata: { id: 0, answer: "フライパン" }
  },
  {
    pageContent: "ペンはペンでも食べられるペンは？",
    metadata: { id: 1, answer: "ペンネ" }
  }
];

/**
 * 最初の設問プロンプト
 */
const detectIntentPrompt = PromptTemplate.fromTemplate(`
  以下の発言が「なぞなぞを始めたい」という意図を含むかを「YES」または「NO」で答えてください。
  
  発言: {input}
  答え:
`);

/**
 * なぞなぞを始めるかどうかの問い
 * @param param 
 * @returns 
 */
async function detectIntent({ messages, wantRiddle }: typeof StateAnnotation.State) {
  console.log("0.2: " + messages[0].content);
  console.log("0.3: " + wantRiddle);
  // 最初にLLMに聞いてみる
  const detectIntentChain = detectIntentPrompt.pipe(model);
  const userMsg = messages[messages.length - 1].content;
  const response = await detectIntentChain.invoke({ input: userMsg });
  console.log("0.4: " + response.content);

  // 答え次第では始める
  const answerText =
    typeof response.content === "string"
      ? response.content
      : response.content.map((c: any) => c.text ?? "").join("");

  const want = answerText.trim().toUpperCase().includes("YES");
  return {
    messages: [...messages, new AIMessage(`${want ? "あなたはなぞなぞの出題者です。下記の問題を変更を加えず出題してください。\n" : "（世間話を行う）\n"}`)],
    wantRiddle: want,
  };
}

/**
 * 終わりのメッセージ
 */
async function exit({ messages, wantRiddle }: typeof StateAnnotation.State) {
  return {
    messages: [...messages, new AIMessage("また今度やろうね。")],
  };
}

/**
 * 問題の提示と選定
 */
async function selectAndPresentQuestion({ messages, wantRiddle }: typeof StateAnnotation.State) {
  // ランダムに問題を選択
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  messages[messages.length -1].content += "問題【" + randomQuestion.pageContent + "】";

  console.log("1: " + messages[messages.length -1].content);

  return { 
    messages: [...messages],
  };
}


/** 
 * ユーザーに回答を促すノード
 */ 
async function receiveAnswer({ messages, wantRiddle }: typeof StateAnnotation.State) {
  // なぞなぞは継続
  wantRiddleState = wantRiddle;

  console.log("2: " + wantRiddleState);
  return {
    messages: [...messages, new AIMessage("userに回答を求めてください。")],
  };
}


/**
 * ヒント計算ノード
 */
async function giveHint({ messages, wantRiddle, clear }: typeof StateAnnotation.State)  {
  const userMessage = messages[messages.length - 1];
  const userAnswer = typeof userMessage.content === "string"
    ? userMessage.content
    : userMessage.content.map((c: any) => c.text ?? "").join("");
  
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-large"
  });
  const docs = questions.map(q => new Document({
    pageContent: q.metadata.answer,
    metadata: { ...q.metadata, question: q.pageContent }
  }));
  
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  const result = await vectorStore.similaritySearchWithScore(userAnswer, 1);
  const [bestMatch, score] = result[0];
  console.log("2.5: " + score);
  let hint = "ユーザーに応援の言葉を投げかけてください。";
  if (score > 0.6) hint = "ユーザーに答えに近かったことを伝えてください。";
  if (score >= 0.9) return {clear: true};

  console.log("3: " + hint);
  return {
    messages: [...messages, new AIMessage(hint)],
  };
}


/**
 * プロンプト+モデルチェーン
 */

const prompt = PromptTemplate.fromTemplate("{chat_history}\nuser: {message}\nAI:");
const chain = prompt.pipe(model);


/**
 * 応答生成ノード
 */
async function answer({ messages }: typeof MessagesAnnotation.State) {
  // なぞなぞはおしまい
  wantRiddleState = false;

  return {
    messages: [...messages, new AIMessage("ユーザーがなぞなぞに正解しました。褒めたたえてください。")],
  };
}


/**
 * グラフ定義
 */
export const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  wantRiddle: Annotation<boolean>({
    value: (state: boolean = false, action: boolean) => action,
    default: () => wantRiddleState,
  }),
  clear: Annotation<boolean>({
    value: (state: boolean = false, action: boolean) => action,
    default: () => false,
  }),
});

const graph = new StateGraph(StateAnnotation)
  .addNode("detectIntent", detectIntent)  // 始めるかどうかのノード
  .addNode("selectQuestion", selectAndPresentQuestion) // 問題選定ノード
  .addNode("receiveAnswer", receiveAnswer) // ユーザーの回答を受け付けるノード
  .addNode("giveHint", giveHint) // ヒント計算ノード
  .addNode("answer", answer) // 応答生成ノード
  .addNode("exit", exit)  // 終了セリフノード

  .addConditionalEdges("__start__", (state) => state.wantRiddle ? "giveHint" : "detectIntent")
  .addConditionalEdges("detectIntent", (state) => state.wantRiddle ? "selectQuestion" : "exit")
  .addConditionalEdges("giveHint" , (state) => state.clear ? "answer" : "receiveAnswer")
  .addEdge("selectQuestion", "receiveAnswer")
  .addEdge("answer", "exit")
  .compile();


/**
 * ストリーミング
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    
    console.log("0");

    // 直近のメッセージを取得
    const userMessage = messages.at(-1).content;
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ユーザーのメッセージを受け取る
    const result = await graph.invoke({
      messages: [new HumanMessage(userMessage)],
    });
    
    console.log("98: " + result.messages[1].content);
    console.log("99: " + wantRiddleState);

    // ストリーミング応答を取得
    const prompt = PromptTemplate.fromTemplate("assistant: {message}\nassistant:");
    const chain = prompt.pipe(model);
    const stream = await chain.stream({ 
      message: result.messages[1].content
    });

  // LangChainのストリーム出力を Webレスポンス用のストリーム形式に変換する
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