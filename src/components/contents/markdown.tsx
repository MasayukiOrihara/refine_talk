import { errStore } from "@/hooks/useErrorStore";
import { useSessionStore } from "@/hooks/useSessionId";
import { MARKDOWN_READ_API } from "@/lib/api/path";
import { requestApi } from "@/lib/api/request/request";
import { MARKDOWN_NAME } from "@/lib/constants";

import { MarkdownInfo } from "@/lib/schema";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import * as ERR from "@/lib/messages/error";

export const Markdown: React.FC<{ page: number }> = ({ page }) => {
  const [content, setContent] = useState("");

  // MD ファイルを読み込む API を叩いて取得
  useEffect(() => {
    console.log("ページ番号: " + page);

    const file = MARKDOWN_NAME[page];
    const dir = "public/markdowns/question/it";
    const mdInfo: MarkdownInfo = { file, dir };

    (async () => {
      try {
        const res: string = await requestApi("", MARKDOWN_READ_API, {
          method: "POST",
          body: { mdInfo },
        });
        setContent(res);
      } catch (err) {
        // MD 取得失敗
        const tags = ["frontend", "markdown"];

        toast.error(ERR.FILE_READ_ERROR_TOAST);
        errStore({
          message: ERR.MD_READ_ERROR,
          err,
          tags,
        });
      }
    })();
  }, [page]);

  return (
    <div className="markdown-body w-2xl m-5 text-zinc-500 border-zinc-200">
      <div className="border border-dashed p-6 rounded">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
