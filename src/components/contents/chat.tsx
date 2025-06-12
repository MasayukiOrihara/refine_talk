import { useChat } from "@ai-sdk/react";
import { CircleCheckBig, SendHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import { Ellipsis } from "lucide-react";

import { Button } from "../ui/button";
import { ChatProps } from "@/lib/type";
import { TOAST_ERROR } from "@/lib/constants";

// 最大入力文字数
const max = 400;

export const Chat: React.FC<ChatProps> = ({
  page,
  setOnAnswer,
  setMessage,
  aiMessage,
  answerStatus,
}) => {
  const { messages, input, status, handleInputChange, handleSubmit } = useChat({
    // APIの読み込み
    api: "api/refinetalk",
    headers: {
      page: page.toString(),
    },
    onError: (e) => {
      toast.error(TOAST_ERROR);
      console.log(e);
    },
  });

  // assistantメッセージ取得
  const assistantMessage = [...messages]
    .reverse()
    .find((msg) => msg.role === "assistant");

  // ユーザーメッセージ取得
  const userMessages = messages.filter((msg) => msg.role === "user");

  // 模範解答精製用ボタンハンドル
  const handleAnswer = () => {
    setOnAnswer(true);
    setMessage(messages[messages.length - 2].content);
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

      <form onSubmit={handleSubmit} className="w-full max-w-2xl p-4">
        <div className="flex w-full gap-4">
          <textarea
            className="bg-zinc-800 w-full p-2 h-30 border border-zinc-700 rounded shadow-xl text-white placeholder:text-neutral-400"
            value={input}
            placeholder="回答をしてください... [ENTER で 改行]"
            disabled={status === "submitted" || answerStatus === "submitted"}
            onChange={handleInputChange}
          />

          <div className="flex flex-col  self-end">
            <div className="text-sm text-center mb-2 text-neutral-400">
              <div
                className={
                  input.length > max ? "text-red-500" : "text-zinc-500"
                }
              >
                {input.length} / {max}
              </div>
            </div>

            <Button
              title={"模範解答を作成"}
              onClick={handleAnswer}
              disabled={
                status === "submitted" ||
                answerStatus === "submitted" ||
                messages.length < 4
              }
              className="w-18 h-8 rounded mb-2 hover:cursor-pointer "
            >
              <CircleCheckBig
                className={answerStatus === "submitted" ? "animate-spin" : ""}
              />
            </Button>

            <Button
              title={"送信"}
              type="submit"
              disabled={
                input.length > max ||
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
    </div>
  );
};
