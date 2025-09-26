"use client";

import { messageText } from "@/lib/llm/message";
import { useEffect, useRef } from "react";
import { useUserMessages } from "../provider/MessageProvider";
import { useRefineTalkChat } from "@/hooks/useRefineChat";
import { useSessionId } from "@/hooks/useSessionId";

const ANSWER_API = "/api/answer";

export const Answer: React.FC<{ file: string }> = ({ file }) => {
  // プロバイダーから取得
  const {
    currentUserMessage,
    setAiAnswer,
    setAnswerStatus,
    onAnswer,
    setOnAnswer,
  } = useUserMessages();
  // session Id の取得
  const sessionId = useSessionId();
  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const { messages, status, sendMessage } = useRefineTalkChat(ANSWER_API);

  // 模範解答生成ボタンが押されたら、生成開始する
  useEffect(() => {
    if (!onAnswer) return;

    console.log(currentUserMessage);
    sendMessage(
      {
        role: "user",
        parts: [{ type: "text", text: currentUserMessage! }],
      },
      { body: { sessionId: sessionIdRef.current, file: file } }
    );

    setOnAnswer(false);
  }, [onAnswer]);

  // AIメッセージ監視用の別のuseEffect
  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    // 最後のメッセージがAIからのものかチェック
    if (lastMessage.role === "assistant") {
      setAiAnswer(messageText(lastMessage));
    }
  }, [messages]);

  // aiの状態を取得
  useEffect(() => {
    setAnswerStatus(status);
  }, [status]);

  return null;
};
