import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Message as VercelChatMessage } from "ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 会話履歴を渡すためのフォーマット */
export const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

/**
 * キーワード以降の文字を抜き出す関数
 * @param input
 * @param keyword
 * @returns
 */
export function cutKeyword(input: string, keyword: string): string {
  const index = input.indexOf(keyword);
  if (index === -1) return input;

  const endIndex = input.indexOf("\n", index);
  if (endIndex === -1) return input.slice(index + keyword.length);

  return input.slice(index + keyword.length, endIndex);
}
