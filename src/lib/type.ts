/** propsで使っている型 */
export type AnswerProps = {
  page: number;
  onAnswer: boolean;
  setOnAnswer: (v: boolean) => void;
  message: string;
  setAiMessage: (v: string) => void;
  setAnswerStatus: (v: string) => void;
};

export type ChatProps = {
  page: number;
  setOnAnswer: (v: boolean) => void;
  setMessage: (v: string) => void;
  aiMessage: string;
  answerStatus: string;
};
