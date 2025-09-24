"use client";

import { TOAST_ERROR } from "@/lib/constants";
import { messageText } from "@/lib/llm/message";
import { AnswerProps } from "@/lib/type";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect } from "react";
import { toast } from "sonner";
import { useUserMessages } from "../provider/MessageProvider";
import { useRefineTalkChat } from "@/hooks/useRefineChat";

const ANSWER_API = "/api/answer";

export const Answer: React.FC = () => {
  // プロバイダーから取得
  const {
    currentUserMessage,
    setAiMessage,
    setAnswerStatus,
    onAnswer,
    setOnAnswer,
    file,
  } = useUserMessages();

  const { messages, status, sendMessage } = useRefineTalkChat(ANSWER_API);

  // 模範解答生成ボタンが押されたら、生成開始する
  useEffect(() => {
    if (!onAnswer) return;

    console.log(currentUserMessage);
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: currentUserMessage! }],
    });

    setOnAnswer(false);
  }, [onAnswer]);

  // AIメッセージ監視用の別のuseEffect
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // 最後のメッセージがAIからのものかチェック
      if (lastMessage.role === "assistant") {
        setAiMessage(messageText(lastMessage));
      }
    }
  }, [messages]);

  // aiの状態を取得
  useEffect(() => {
    setAnswerStatus(status);
  }, [status]);

  return null;
};
