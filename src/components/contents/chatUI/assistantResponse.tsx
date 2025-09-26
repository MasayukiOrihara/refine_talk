import { Ellipsis } from "lucide-react";

import { useUserMessages } from "@/components/provider/MessageProvider";
import { ChatStatus } from "ai";

type AssistantResponseProps = {
  status: ChatStatus;
};

export default function AssistantResponse({ status }: AssistantResponseProps) {
  const {
    currentUserMessage,
    assistantMessages,
    currentAssistantMessage,
    aiAnswer,
    answerStatus,
    setOnAnswer,
    setFile,
  } = useUserMessages();

  return (
    <div>
      {currentAssistantMessage && !(status === "submitted") && (
        <div
          key={currentAssistantMessage}
          className="whitespace-pre-wrap px-5 py-3 rounded-lg mb-2 mx-8 flex gap-2 text-gray-400"
        >
          <div className="h-8 px-3 py-2 font-bold text-xs rounded-lg bg-[#ff6467]/20 text-zinc-500 w-auto whitespace-nowrap">
            評価
          </div>
          <p
            className="mt-1 text-sm text-green-500 font-bold"
            style={{ overflowWrap: "anywhere" }}
          >
            {currentAssistantMessage}
          </p>
          {/* {assistantMessage.parts.map((part, i) => (
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
          ))} */}
        </div>
      )}

      {status === "submitted" && (
        <div className="flex flex-col py-4 my-4 items-center w-full text-sm border text-zinc-500">
          <p className="mb-2">ここに評価が表示されます</p>
          <Ellipsis className="animate-ping" />
        </div>
      )}

      {/** 模範解答はここに */}
      {aiAnswer && (
        <div className="mb-4 p-4 bg-zinc-600 rounded text-sm text-white">
          <p className="border mb-2 p-1 text-center">模範解答 </p>
          {aiAnswer}
        </div>
      )}
    </div>
  );
}
