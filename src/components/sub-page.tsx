"use client";

import { useState } from "react";
import { Chat } from "./contents/chat";
import { Markdown } from "./contents/markdown";
import { Navi } from "./navi-header";
import { Answer } from "./contents/answer";

export const SubPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [onAnswer, setOnAnswer] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [aiMessage, setAiMessage] = useState<string>("");

  return (
    <div className="w-full h-full">
      <Navi page={page} setPage={setPage} />
      <div className="mt-2 flex flex-col md:flex-row max-w-7xl mx-auto gap-2 overflow-hidden">
        <Markdown page={page} />
        <Answer
          onAnswer={onAnswer}
          setOnAnswer={setOnAnswer}
          message={message}
          setAiMessage={setAiMessage}
        />
        <Chat
          setOnAnswer={setOnAnswer}
          setMessage={setMessage}
          aiMessage={aiMessage}
        />
      </div>
    </div>
  );
};
