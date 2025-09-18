import { Client } from "langsmith";
import { ChatAnthropic } from "@langchain/anthropic";
import { StringOutputParser } from "@langchain/core/output_parsers";

/** langchainのstring parser */
export const outputParser = new StringOutputParser();

/** langsmithのクライアント用 */
export const client = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
});

/** haiku3.5 */
export const Haike3_5 = new ChatAnthropic({
  model: "claude-3-5-haiku-latest",
  apiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.3,
  streaming: true,
  streamUsage: true,
  tags: ["refinetalk"],
});
