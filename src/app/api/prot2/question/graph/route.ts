import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { StateGraph } from "@langchain/langgraph";
import { MessagesAnnotation } from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { NextApiRequest, NextApiResponse } from 'next';
import { LangChainAdapter } from "ai";


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
 * 問題の提示と選定
 */
async function selectAndPresentQuestion({ messages }: typeof MessagesAnnotation.State) {
  // ランダムに問題を選択
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  const questionMessage = new AIMessage(randomQuestion.pageContent);

  console.log("1: " + questionMessage.content);

  return { messages: messages };
}


/** 
 * ユーザーの回答を受け取るノード
 */ 
async function receiveAnswer({ messages }: typeof MessagesAnnotation.State) {
  const userMessage = messages[messages.length - 1];
  const userAnswer = typeof userMessage.content === "string"
    ? userMessage.content
    : userMessage.content.map((c: any) => c.text ?? "").join("");

    console.log("2: " + userAnswer);
  return { messages: [userAnswer] };
}


/**
 * ヒント計算ノード
 */
async function giveHint({ messages }: typeof MessagesAnnotation.State)  {
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
  let hint = "全然惜しくない";
  if (score > 0.7) hint = "惜しい";
  if (score >= 0.9) hint = "正解！";

  const hintMsg = new AIMessage(hint);

  console.log("3: " + hintMsg.content);
  return { messages: [hintMsg] };
}


/**
 * プロンプト+モデルチェーン
 */
const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o", temperature: 0.3 });
const prompt = PromptTemplate.fromTemplate("{chat_history}\nuser: {message}\nAI:");
const chain = prompt.pipe(model);


/**
 * 応答生成ノード
 */
async function answer({ messages }: typeof MessagesAnnotation.State) {
  const userMsg = messages[messages.length - 1].content;
  const history = messages.slice(0, -1).map(m => `${m._getType()}: ${m.content}`).join("\n");
  const message = await chain.invoke({ message: userMsg, chat_history: history });
  console.log("4: " + message.content);
  return { messages: message };
}


/**
 * グラフ定義
 */
const graph = new StateGraph(MessagesAnnotation)
  .addNode("selectQuestion", selectAndPresentQuestion) // 問題選定ノード
  .addNode("receiveAnswer", receiveAnswer) // ユーザーの回答を受け付けるノード
  .addNode("giveHint", giveHint) // ヒント計算ノード
  .addNode("answer", answer) // 応答生成ノード
  .addEdge("__start__", "selectQuestion")  // 最初に問題選定を行う
  .addEdge("selectQuestion", "receiveAnswer")
  .addEdge("receiveAnswer", "giveHint")
  .addEdge("giveHint", "answer") // ヒントの後に答えを生成
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
      messages: [new HumanMessage(userMessage)]
    });

    console.log(result.messages[3].content);

    // ストリーミング応答を取得
    const prompt = PromptTemplate.fromTemplate("user: {message}\nassistant:");
    const chain = prompt.pipe(model);
    const stream = await chain.stream({ 
      message: result 
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