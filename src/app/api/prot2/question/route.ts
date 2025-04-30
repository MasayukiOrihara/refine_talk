import { PromptTemplate } from '@langchain/core/prompts';
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';

import { getModel, isObject, loadJsonFile } from '@contents/utils';
import type { PromptTemplateJson } from '@contents/type'
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';

// なぞなぞオブジェクト
type Metadata = {
  id: number;
  answer: string;
};
type Question = {
  pageContent: string;
  metadata: Metadata;
};
const questions: Question[] = [
  {
    pageContent: "パンはパンでも食べられないパンは？",
    metadata: {
      id: 0,
      answer: "フライパン"
    }
  },
  {
    pageContent: "ペンはペンでも食べられるペンは？",
    metadata: {
      id: 1,
      answer: "ペンネ"
    }
  }
];

/**
 * 基本構成
 * 【　4月末リファクタリング済み　】
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  try {
    // チャット履歴と選択したモデル
    const [messages, modelName] = await req.json().then(body => [
      body.messages ?? [], 
      body.model ?? 'fake-llm'
    ]);
 
    //プロンプトテンプレートの作成
    const template = await loadJsonFile<PromptTemplateJson[]>('src/data/prompt-template.json');
    if (!template.success) {
      return new Response(JSON.stringify({ error: template.error }),{
        status: 500,
        headers: { 'Content-type' : 'application/json' },
      });
    }

    // プロンプトテンプレートの抽出
    const found1 = template.data.find(obj => isObject(obj) && obj['name'] === 'api-prot2-question1');
    const found2 = template.data.find(obj => isObject(obj) && obj['name'] === 'api-prot2-question2');
    if (!found1 || !found2) {
      throw new Error('テンプレートが見つかりませんでした');
    }

    // 初回メッセージ
    if(messages.length === 1) {
      messages.push({
        role: "assistant",
        content: found1.template.replace("{question}", questions[0].pageContent)
      });
    }

    // console.log(messages);
    // console.log(messages.length);

    // チャット形式
    const formatMessage = (message: VercelChatMessage) => {
      return `${message.role}: ${message.content}`;
    };

    // 過去の履歴 {chat_history}用
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatMessage);

    console.log(formattedPreviousMessages);

    // 直近のメッセージを取得
    const userMessage = messages.at(-1).content;
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // プロンプトの設定 
    const prompt = PromptTemplate.fromTemplate(found2.template);
 
    // モデルの指定
    const model = getModel(modelName);

    // 埋め込みモデル
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
      apiKey: process.env.OPENAI_API_KEY
    });

    // 答えだけを取り出す
    const docs = questions.map((q) => new Document({
      pageContent: q.metadata.answer,
      metadata: { ...q.metadata, question: q.pageContent }
    }));

    // インメモリにベクトル保存
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    // console.log(vectorStore);

    const response = await vectorStore.similaritySearchWithScore(userMessage, 2);
    // console.log(response);

    // ヒントを出す
    let hint: string = "";
    const [bestMatchDoc, bestMatchScore] = response[0];
    if(bestMatchScore < 0.3){
      hint = "全然惜しくない";
    } else if (bestMatchScore < 0.7){
      hint = "惜しい";
    } else {
      hint = "正解！";
    }
 
    // パイプ処理
    const chain = prompt.pipe(model);
 
    // ストリーミング応答を取得
    const stream = await chain.stream({
      hint: hint,
      chat_history: formattedPreviousMessages,
      message: userMessage
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