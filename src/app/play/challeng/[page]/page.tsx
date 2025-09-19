import { useEffect, useState } from "react";

import { useSessionStore } from "@/hooks/useSessionId";
import { FeatureLayout } from "@/components/layouts/FeatureLayout";
import { Navi } from "@/components/parts/navi-header";
import { Answer } from "@/components/contents/answer";
import { Markdown } from "@/components/contents/markdown";
import { Chat } from "@/components/contents/chat";

export default async function Page({ params }: { params: { page: number } }) {
  const [onAnswer, setOnAnswer] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [aiMessage, setAiMessage] = useState<string>("");
  const [answerStatus, setAnswerStatus] = useState<string>("");

  const { page } = await params;

  return (
    <FeatureLayout>
      <div className="mt-2 flex flex-col md:flex-row max-w-7xl mx-auto gap-2 overflow-hidden">
        <Markdown page={page} file={""} />
        <Answer
          page={page}
          onAnswer={onAnswer}
          setOnAnswer={setOnAnswer}
          message={message}
          setAiMessage={setAiMessage}
          setAnswerStatus={setAnswerStatus}
        />
        <Chat
          page={page}
          setOnAnswer={setOnAnswer}
          setMessage={setMessage}
          aiMessage={aiMessage}
          answerStatus={answerStatus}
        />
      </div>
    </FeatureLayout>
  );
}
