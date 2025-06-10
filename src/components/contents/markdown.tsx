import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MARKDOWN_PATH = [
  "/markdowns/q1_morning-meeting.md",
  "/markdowns/q2_group-info.md",
  "/markdowns/q3_slide-review.md",
  "/markdowns/q4_meeting-report.md",
  "/markdowns/q5_phone-call.md",
  "/markdowns/q6_email-report.md",
];

export const Markdown: React.FC<{ page: number }> = ({ page }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    console.log("ページ番号: " + page);
    fetch(MARKDOWN_PATH[page])
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
