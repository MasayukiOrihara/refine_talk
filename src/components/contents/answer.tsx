import { useChat } from "@ai-sdk/react";
import { on } from "events";
import { useEffect } from "react";
import { toast } from "sonner";

type AnswerProps = {
  onAnswer: boolean;
  setOnAnswer: (v: boolean) => void;
  message: string;
  setAiMessage: (v: string) => void;
};

export const Answer: React.FC<AnswerProps> = ({
  onAnswer,
  setOnAnswer,
  message,
  setAiMessage,
}) => {
  const { messages, append } = useChat({
    api: "api/answer",
    onError: (e) => {
      toast.error("エラーが発生しました");
      console.log(e);
    },
  });

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

  return null;
};
