import { Message as VercelChatMessage, LangChainAdapter } from 'ai';
import { createNode, createGraph } from "@langchain/langgraph/";
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';


/** 状態モデルの設計 */
type GraphState = {
  messages: VercelChatMessage[];
  userMessage: string;
  hint?: string;
  score?: number;
};

/** ノード（処理ステップ）の定義 */
// ヒント生成ノード
const generateHintNode = createNode<GraphState>(async (state) => {
  const docs = questions.map((q) => new Document({
    pageContent: q.metadata.answer,
    metadata: { ...q.metadata, question: q.pageContent }
  }));

  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-large",
    apiKey: process.env.OPENAI_API_KEY
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  const results = await vectorStore.similaritySearchWithScore(state.userMessage, 1);
  const [bestDoc, bestScore] = results[0];

  let hint = "";
  if (bestScore < 0.3) hint = "全然惜しくない";
  else if (bestScore < 0.7) hint = "惜しい";
  else hint = "正解！";

  return {
    ...state,
    hint,
    score: bestScore
  };
});

// モデル応答ノード
const responseNode = createNode<GraphState>(async (state) => {
  const prompt = PromptTemplate.fromTemplate(found2.template);
  const chain = prompt.pipe(getModel(modelName));

  const stream = await chain.stream({
    message: state.userMessage,
    hint: state.hint,
    chat_history: state.messages.map(formatMessage).slice(0, -1)
  });

  return {
    ...state,
    stream
  };
});
