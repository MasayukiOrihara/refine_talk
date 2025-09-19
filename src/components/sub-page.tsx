"use client";

import { useEffect, useState } from "react";
import { Chat } from "./contents/chat";
import { Markdown } from "./contents/markdown";
import { Navi } from "./parts/navi-header";
import { Answer } from "./contents/answer";
import { useSessionStore } from "@/hooks/useSessionId";

export const SubPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [onAnswer, setOnAnswer] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [aiMessage, setAiMessage] = useState<string>("");
  const [answerStatus, setAnswerStatus] = useState<string>("");

  const { init } = useSessionStore();

  // ここで session ID を初期化
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="w-full h-full">
      <Navi page={page} setPage={setPage} />
      <div className="mt-2 flex flex-col md:flex-row max-w-7xl mx-auto gap-2 overflow-hidden">
        <Markdown page={page} />
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
    </div>
  );
};
