"use client";

import { FormEvent, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { CircleCheckBig, SendHorizontalIcon } from "lucide-react";

import { useUserMessages } from "@/components/provider/MessageProvider";
import { Button } from "@/components/ui/button";
import { INPUT_LENGTH_MAX } from "../chat";

type ChatStatus = ReturnType<typeof useChat>["status"];
type ChatInputProps = {
  status: ChatStatus;
  onSubmit: (input: string) => void;
};

export default function ChatInput({ status, onSubmit }: ChatInputProps) {
  const [input, setInput] = useState("");
  const { userMessages, answerStatus, setOnAnswer } = useUserMessages();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    onSubmit(input); // 親でハンドル
    setInput(""); // 文字列削除
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl p-4">
      {/** フォーム */}
      <div className="flex w-full gap-4">
        <textarea
          className="bg-zinc-800 w-full p-2 h-30 border border-zinc-700 rounded shadow-xl text-white placeholder:text-neutral-400"
          value={input}
          placeholder="回答をしてください... [ENTER で 改行]"
          disabled={status === "submitted" || answerStatus === "submitted"}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex flex-col  self-end">
          <div className="text-sm text-center mb-2 text-neutral-400">
            <div
              className={
                input.length > INPUT_LENGTH_MAX
                  ? "text-red-500"
                  : "text-zinc-500"
              }
            >
              {input.length} / {INPUT_LENGTH_MAX}
            </div>
          </div>

          {/** 模範解答出力ボタン */}
          <Button
            title={"模範解答を作成"}
            onClick={() => setOnAnswer(true)}
            disabled={
              status === "submitted" ||
              answerStatus === "submitted" ||
              userMessages.length < 2 // 回答が2個以上あったら
            }
            className="w-18 h-8 rounded mb-2 hover:cursor-pointer "
          >
            <CircleCheckBig
              className={answerStatus === "submitted" ? "animate-spin" : ""}
            />
          </Button>

          {/** ユーザー回答送信ボタン */}
          <Button
            title={"送信"}
            type="submit"
            disabled={
              input.length > INPUT_LENGTH_MAX ||
              status === "submitted" ||
              answerStatus === "submitted"
            }
            className="w-18 h-10 bg-[#00bc7d] text-white p-2 rounded hover:bg-emerald-900 hover:cursor-pointer hover:text-white/40"
          >
            <SendHorizontalIcon
              className={status === "submitted" ? "animate-ping" : ""}
            />
          </Button>
        </div>
      </div>
    </form>
  );
}
