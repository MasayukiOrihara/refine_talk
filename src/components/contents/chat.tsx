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

// 最大入力文字数
export const INPUT_LENGTH_MAX = 400;

export const Chat: React.FC<{ file: string }> = ({ file }) => {
  // プロバイダーから取得
  const {
    addUserMessage,
    currentUserMessage,
    aiMessage,
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
      <div className="flex flex-col overflow-y-auto mb-18">
        {/* アシスタントの最新メッセージ（1件）を上に表示 */}
        {assistantMessage && !(status === "submitted") && (
          <div
            key={assistantMessage.id}
            className="whitespace-pre-wrap px-5 py-3 rounded-lg mb-2 mx-8 flex gap-2 text-gray-400"
          >
            <div className="h-8 px-3 py-2 font-bold text-xs rounded-lg bg-[#ff6467]/20 text-zinc-500 w-auto whitespace-nowrap">
              評価
            </div>
            {assistantMessage.parts.map((part, i) => (
              <div
                key={`${assistantMessage.id}-${i}`}
                className="break-words overflow-hidden"
              >
                {"text" in part ? (
                  <p className="mt-1" style={{ overflowWrap: "anywhere" }}>
                    {part.text}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {status === "submitted" && (
          <div className="flex flex-col py-4 my-4 items-center w-full text-sm border text-zinc-500">
            <p className="mb-2">ここに評価が表示されます</p>
            <Ellipsis className="animate-ping" />
          </div>
        )}

        {/** 模範解答はここに */}
        {aiMessage && (
          <div className="mb-4 p-4 bg-zinc-600 rounded text-sm text-white">
            <p className="border mb-2 p-1 text-center">模範解答 </p>
            {aiMessage}
          </div>
        )}

        {/* ユーザーメッセージは通常の順序で下に表示 */}
        {userMessages.map((message) => (
          <div
            key={message.id}
            className="whitespace-pre-wrap px-5 py-3 rounded-lg mb-2 mx-8 flex gap-2 border text-neutral-500 self-start"
          >
            {message.parts.map((part, i) => (
              <div
                key={`${message.id}-${i}`}
                className="break-words overflow-hidden"
              >
                {"text" in part ? (
                  <p className="mt-1" style={{ overflowWrap: "anywhere" }}>
                    {part.text}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/** 入力バー */}
      <ChatInput status={status} onSubmit={handleSubmit} />
    </div>
  );
};
