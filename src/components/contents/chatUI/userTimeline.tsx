"use client";

import { useUserMessages } from "@/components/provider/MessageProvider";

export default function UserTimeline() {
  const { userAnswers } = useUserMessages();
  return (
    <div>
      {userAnswers
        .slice()
        .reverse()
        .map((msg, index) => (
          <div
            key={`${msg}-${index}`}
            className="flex flex-row whitespace-pre-wrap px-5 py-3 rounded-lg mb-2 mx-8 gap-2 border text-neutral-500 self-start"
          >
            <div className="flex flex-col gap-1">
              <span className="w-5 h-5 border-2 border-zinc-400 flex items-center justify-center">
                {index + 1}
              </span>
              <span>{msg.score}点</span>
            </div>
            <p className="mt-1" style={{ overflowWrap: "anywhere" }}>
              {msg.answer}
            </p>
          </div>
        ))}
    </div>
  );
}
