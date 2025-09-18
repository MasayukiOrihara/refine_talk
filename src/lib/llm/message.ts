import { UIMessage } from "ai";

/** UIMessage から text を取り出す処理 */
export function messageText(m: UIMessage): string {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

/** 会話履歴を渡すためのフォーマット */
export const formatMessage = (message: UIMessage) => {
  return `${message.role}: ${messageText(message)}`;
};
