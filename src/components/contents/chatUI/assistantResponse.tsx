import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";

import { useUserMessages } from "@/components/provider/MessageProvider";
import { ChatStatus } from "ai";
import { useEffect, useState } from "react";

type AssistantResponseProps = {
  status: ChatStatus;
};

export default function AssistantResponse({ status }: AssistantResponseProps) {
  const [aiResponse, setAiResponse] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [seenPages, setSeenPages] = useState<number[]>([0]);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const { currentAssistantMessage, aiAnswer } = useUserMessages();

  // response を積み上げる
  useEffect(() => {
    setIsHistoryMode(false); // 最新に戻る
    if (!currentAssistantMessage) return;
    if (status !== "ready") return;

    setIndex(aiResponse.length - 1);
    setAiResponse([...aiResponse, currentAssistantMessage]);
  }, [currentAssistantMessage, status]);

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setIsHistoryMode(true); // 履歴モードに入る
    }
    // 表示済み
    if (!seenPages.includes(index)) {
      setSeenPages((prev) => [...prev, index]);
    }
  };

  const handleNext = () => {
    if (index < aiResponse.length - 1) {
      setIndex(index + 1);
      setIsHistoryMode(true);
    } else {
      setIsHistoryMode(false); // 最新に戻る
    }
    // 表示済み
    if (!seenPages.includes(index)) {
      setSeenPages((prev) => [...prev, index]);
    }
  };

  // ページネーションのボタン制限
  const cantUseButton =
    aiResponse.length === 0 ||
    (aiResponse.length === 0 && status === "streaming");

  return (
    <div className="relative w-full h-full">
      <div className=" flex flex-col whitespace-pre-wrap px-5 py-3 rounded-lg gap-2 text-neutral-500 self-start">
        {/* 中央に1つ表示 */}
        <div
          className="mt-1 text-sm text-green-500 font-bold"
          style={{ overflowWrap: "anywhere" }}
        >
          {isHistoryMode ? (
            <div>{aiResponse[index]}</div>
          ) : (
            currentAssistantMessage &&
            !(status === "submitted") && <div>{currentAssistantMessage}</div>
          )}
        </div>

        {/* ページング */}
        {status === "ready" && Boolean(aiResponse.length) && (
          <div className="flex gap-1">
            {/** 左ボタン */}
            <button
              onClick={handlePrev}
              disabled={index === 0}
              className="px-3 py-1 bg-gray-100 rounded disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* 真ん中要素 */}
            <div
              className={`w-full py-1 bg-gray-100 ${
                cantUseButton ? "opacity-40" : "opacity-100"
              }`}
            >
              <div className="flex my-1 m-auto w-fit gap-1">
                {Array.from({ length: aiResponse.length }).map((_, i) => {
                  const isSeen = seenPages.includes(i);
                  const colorClass = isSeen
                    ? "text-zinc-600"
                    : "text-green-500";
                  return (
                    <span key={i} className={`text-xs ${colorClass}`}>
                      {i === index ? "●" : "○"}
                    </span>
                  );
                })}
                <span className={"text-xs invisible"}>
                  {aiResponse.length === 0 ? "○" : ""}
                </span>
              </div>
            </div>

            {/* 右ボタン */}
            <button
              onClick={handleNext}
              disabled={index === aiResponse.length - 1}
              className="px-3 py-1 bg-gray-100 rounded disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/** AI のローディング画面 */}
      {status === "submitted" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 text-sm text-zinc-500">
          <p className="mb-2">ここに評価が表示されます</p>
          <Ellipsis className="animate-ping w-6 h-6" />
        </div>
      )}

      {/** 模範解答はここに */}
      {aiAnswer && (
        <div className="absolute inset-0 p-4 bg-zinc-600 rounded text-sm text-white">
          <p className="border mb-2 p-1 text-center">模範解答 </p>
          {aiAnswer}
        </div>
      )}
    </div>
  );
}
