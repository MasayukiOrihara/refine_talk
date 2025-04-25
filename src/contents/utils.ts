import { ChatAnthropic } from '@langchain/anthropic';
import { FakeListChatModel } from '@langchain/core/utils/testing';
import { ChatOpenAI } from '@langchain/openai';
import { readFile } from 'fs/promises';
import path from 'path';

/**
 * JSONファイル読み込み用関数
 * @param relativePath JSONファイルパス
 * @returns オブジェクト
 */
export async function loadJsonFile<T = unknown>(relativePath: string): Promise<
  | { success: true; data: T }
  | { success: false; error: string }
> {
  const filePath = path.join(process.cwd(), relativePath);

    try {
        const data = await readFile(filePath, 'utf-8');
        const json = JSON.parse(data);
        return { success: true, data: json };
    } catch (error) {
        return {
            success: false,
            error:
            error instanceof Error
            ? error.message
            : 'Unknown error while reading JSON file',
        };
    }
}

/**
 * 型安全オブジェクト判定
 * @param val 
 * @returns 
 */
export function isObject(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null;
}

/**
 * 名前から言語モデルを追加する
 * @param modelName 
 * @returns 
 */
export function getModel(modelName: string){
  let model;

  switch (modelName) {
    case 'gpt-4o':
      model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o-mini',
      temperature: 0.7, // ランダム度（高いほど創造的）
      });
    break;
    case 'claude-haiku':
      model = new ChatAnthropic({
        model: 'claude-3-5-haiku-20241022',
        temperature: 0.7, // ランダム度（高いほど創造的）
      });
    break;
    default:
      model = new FakeListChatModel({
        responses: [
          "（応答結果）",
        ],
      });
  }
  
  return model;
}