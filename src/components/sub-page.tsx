"use client";

import { Chat } from "./contents/chat";
import { Markdown } from "./contents/markdown";

export const SubPage: React.FC = () => (
  <div className="mt-2 flex flex-col md:flex-row w-full max-w-7xl h-full mx-auto gap-2 overflow-hidden">
    <Markdown />
    <Chat />
  </div>
);
