import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { errStore } from "./useErrorStore";
import * as ERR from "@/lib/messages/error";
import { useState } from "react";

/**
 * refine talk 使うためのフック
 */
export function useRefineTalkChat(apiPath: string) {
  const [score, setScore] = useState<number | null>(null);

  const chat = useChat({
    transport: new DefaultChatTransport({
      // APIの読み込み
      api: apiPath,
      credentials: "include",
      fetch: async (input, init) => {
        const res = await fetch(input, init);
        const raw = res.headers.get("x-score");
        const score = raw ? Number(raw) : null;
        setScore(score);

        return res; // ← これを返さないと useChat が動かない
      },
    }),
    // エラー処理
    onError: (e) => {
      toast.error(ERR.CHAT_ERROR_TOAST);
      const tags = ["useChat", "frontend"];

      errStore({ message: ERR.USE_CHAT_ERROR, err: e, tags });
    },
  });

  return {
    ...chat, // messages, input, handleInputChange, handleSubmit, etc
    score, // カスタムで追加した値
  };
}
