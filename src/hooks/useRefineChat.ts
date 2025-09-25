import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { errStore } from "./useErrorStore";
import * as ERR from "@/lib/messages/error";

/**
 * refine talk 使うためのフック
 */
export function useRefineTalkChat(apiPath: string) {
  return useChat({
    transport: new DefaultChatTransport({
      // APIの読み込み
      api: apiPath,
      credentials: "include",
    }),
    // エラー処理
    onError: (e) => {
      toast.error(ERR.CHAT_ERROR_TOAST);
      const tags = ["useChat", "frontend"];

      errStore({ message: ERR.USE_CHAT_ERROR, err: e, tags });
    },
  });
}
