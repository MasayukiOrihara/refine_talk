import { MARKDOWN_NAME } from "@/lib/constants";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Markdown: React.FC<{ page: number }> = ({ page }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    console.log("ページ番号: " + page);
    const filePath = "/markdowns/" + MARKDOWN_NAME[page];
    fetch(filePath)
      .then((res) => res.text())
      .then(setContent);
  }, [page]);

  return (
    <div className="markdown-body w-2xl m-5 text-zinc-500 border-zinc-200">
      <div className="border border-dashed p-6 rounded">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
