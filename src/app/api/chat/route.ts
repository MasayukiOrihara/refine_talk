import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
 
export const maxDuration = 30;

/**
 * 橋本さん制作AIチャットハンズオンカリキュラム
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  const { messages } = await req.json();
 
  

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });
 
  return result.toDataStreamResponse();
}