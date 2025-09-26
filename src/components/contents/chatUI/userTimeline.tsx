"use client";

import { useUserMessages } from "@/components/provider/MessageProvider";

export default function UserTimeline() {
  const { userAnswers } = useUserMessages();
  return (
    <div>
      {userAnswers.map((msg, index) => (
        <div
          key={`${msg}-${index}`}
          className="whitespace-pre-wrap px-5 py-3 rounded-lg mb-2 mx-8 flex gap-2 border text-neutral-500 self-start"
        >
          <p className="mt-1" style={{ overflowWrap: "anywhere" }}>
            {msg.score}
            {msg.answer}
          </p>
          {/* {message.map((part, i) => (
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
          ))} */}
        </div>
      ))}
    </div>
  );
}
