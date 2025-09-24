"use client";

import { useState } from "react";

import { FeatureLayout } from "@/components/layouts/featureLayout";
import { Answer } from "@/components/contents/answer";
import { MarkdownLoader } from "@/components/contents/markdownLoader";
import { Chat } from "@/components/contents/chat";
import { useParams } from "next/navigation";

export default async function Page() {
  const [onAnswer, setOnAnswer] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [aiMessage, setAiMessage] = useState<string>("");
  const [answerStatus, setAnswerStatus] = useState<string>("");

  const { page } = useParams<{ page: string }>();
  const pageNum = Number(page);

  return (
    <FeatureLayout>
      <div className="mt-2 flex flex-col md:flex-row max-w-7xl mx-auto gap-2 overflow-hidden">
        <MarkdownLoader page={pageNum} file={""} />
        <Answer
          page={pageNum}
          onAnswer={onAnswer}
          setOnAnswer={setOnAnswer}
          message={message}
          setAiMessage={setAiMessage}
          setAnswerStatus={setAnswerStatus}
        />
        <Chat
          page={pageNum}
          setOnAnswer={setOnAnswer}
          setMessage={setMessage}
          aiMessage={aiMessage}
          answerStatus={answerStatus}
        />
      </div>
    </FeatureLayout>
  );
}
