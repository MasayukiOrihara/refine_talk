"use client";

import { CircleCheckBig, SendHorizontalIcon } from "lucide-react";
import { Ellipsis } from "lucide-react";

import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { messageText } from "@/lib/llm/message";
import { useRefineTalkChat } from "@/hooks/useRefineChat";
import { REFINETALK_API } from "@/lib/api/path";
import { useUserMessages } from "../provider/MessageProvider";
import { useSessionId } from "@/hooks/useSessionId";
import ChatInput from "./chatUI/chatInput";
import UserTimeline from "./chatUI/userTimeline";
import AssistantResponse from "./chatUI/assistantResponse";

// 最大入力文字数
export const INPUT_LENGTH_MAX = 400;

export const Chat: React.FC<{ file: string }> = ({ file }) => {
  // プロバイダーから取得
  const {
    addUserMessage,
    addAssistantMessage,
    currentUserMessage,
    aiAnswer,
    answerStatus,
    setOnAnswer,
    setFile,
  } = useUserMessages();
  // session Id の取得
  const sessionId = useSessionId();
  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  // useChat のカスタムフック
  const { messages, status, sendMessage } = useRefineTalkChat(REFINETALK_API);

  // assistantメッセージ取得
  const assistantMessage = [...messages]
    .reverse()
    .find((msg) => msg.role === "assistant");

  // ユーザーメッセージ取得
  const userMessages = messages.filter((msg) => msg.role === "user");

  // 模範解答精製用ボタンハンドル
  // const handleAnswer = () => {
  //   setOnAnswer(true);
  //   const previousMessage = messages[messages.length - 2];
  //   addUserMessage(messageText(previousMessage));
  // };

  useEffect(() => {
    if (!messages || !messages.length) return;

    // assistant の最新メッセージを取得
    const assistantMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "assistant");
    if (!assistantMessage) return;

    addAssistantMessage(messageText(assistantMessage));
  }, [messages]);

  // refine talk(メインLLM)に提出
  const handleSubmit = (input: string) => {
    // プロバイダーに入力
    addUserMessage(input);
    // LLM に送信
    sendMessage(
      { role: "user", parts: [{ type: "text", text: input }] },
      { body: { sessionId: sessionId, file: file } }
    );
  };

  return (
    <div className="flex flex-col w-2xl h-full mx-5 gap-2 overflow-hidden">
      <div className="h-[25dvh] border overflow-y-auto">
        {/* アシスタントの最新メッセージ（1件）を上に表示 */}
        <AssistantResponse status={status} />
      </div>

      {/* ユーザーメッセージは通常の順序で下に表示 */}
      <div className="h-[40dvh] border overflow-y-auto mb-2">
        <UserTimeline />
      </div>

      {/** 入力バー */}
      <div className="">
        <ChatInput status={status} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
