"use client";

import { errStore } from "@/hooks/useErrorStore";
import { MARKDOWN_READ_API } from "@/lib/api/path";
import { requestApi } from "@/lib/api/request/request";

import { MarkdownInfo } from "@/lib/schema";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import * as ERR from "@/lib/messages/error";
import { SCENARIO_PATH } from "@/lib/contents/scenarios";

export const MarkdownLoader: React.FC<{ file: string }> = ({ file }) => {
  const [content, setContent] = useState("");

  const dir = SCENARIO_PATH;
  const mdInfo: MarkdownInfo = { file, dir };

  // MD ファイルを読み込む API を叩いて取得
  useEffect(() => {
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
  }, []);

  return (
    <div className="markdown-body w-2xl p-5 text-zinc-500 border-zinc-200">
      <div className="border border-dashed px-12 py-4 rounded">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
