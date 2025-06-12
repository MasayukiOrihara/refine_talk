import { TOAST_ERROR } from "@/lib/constants";
import { AnswerProps } from "@/lib/type";
import { useChat } from "@ai-sdk/react";
import { useEffect } from "react";
import { toast } from "sonner";

export const Answer: React.FC<AnswerProps> = ({
  page,
  onAnswer,
  setOnAnswer,
  message,
  setAiMessage,
  setAnswerStatus,
}) => {
  const { messages, status, append } = useChat({
    api: "api/answer",
    headers: {
      page: page.toString(),
    },
    onError: (e) => {
      toast.error(TOAST_ERROR);
      console.log(e);
    },
  });

  // 模範解答生成ボタンが押されたら、生成開始する
  useEffect(() => {
    if (!onAnswer) return;

    console.log(message);
    append({ role: "user", content: message });

    setOnAnswer(false);
  }, [onAnswer]);

  // AIメッセージ監視用の別のuseEffect
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // 最後のメッセージがAIからのものかチェック
      if (lastMessage.role === "assistant") {
        setAiMessage(lastMessage.content);
      }
    }
  }, [messages]);

  // aiの状態を取得
  useEffect(() => {
    setAnswerStatus(status);
  }, [status]);

  return null;
};
