"use client";

import { useState } from "react";
import { Chat } from "./contents/chat";
import { Markdown } from "./contents/markdown";
import { Navi } from "./navi-header";

export const SubPage: React.FC = () => {
  const [page, setPage] = useState(0);

  return (
    <div className="w-full h-full">
      <Navi page={page} setPage={setPage} />
      <div className="mt-2 flex flex-col md:flex-row max-w-7xl mx-auto gap-2 overflow-hidden">
        <Markdown page={page} />
        <Chat />
      </div>
    </div>
  );
};
