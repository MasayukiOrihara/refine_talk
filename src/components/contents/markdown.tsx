import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Markdown: React.FC = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/markdowns/q1_morning meeting.md")
      .then((res) => res.text())
      .then(setContent);
  }, []);

  return (
    <div className="markdown-body w-2xl m-5 text-zinc-500 border-zinc-200">
      <div className="border border-dashed p-6 rounded">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
