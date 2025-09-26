"use client";

import { ChatStatus } from "ai";
import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
  ReactNode,
} from "react";

type UserAnswer = {
  answer: string;
  score?: string;
};

/* ---------- types ---------- */
type State = {
  userAnswers: UserAnswer[];
  assistantMessages: string[];
  aiAnswer: string;
  answerStatus: ChatStatus;
  onAnswer: boolean;
  file: string;
};

type Action =
  | { type: "ADD_USER_ANSWER"; answer: UserAnswer }
  | { type: "ADD_ASSISTANT_MESSAGE"; msg: string }
  | { type: "SET_AI_ANSWER"; msg: string }
  | { type: "SET_ANSWER_STATUS"; value: ChatStatus }
  | { type: "SET_ON_ANSWER"; value: boolean }
  | { type: "SET_FILE"; file: string }
  | { type: "RESET" };

type Ctx = {
  userAnswers: UserAnswer[];
  addUserAnswer: (answer: UserAnswer) => void;
  currentUserMessage: string | undefined;
  assistantMessages: string[];
  addAssistantMessage: (msg: string) => void;
  currentAssistantMessage: string | undefined;
  aiAnswer: string;
  setAiAnswer: (msg: string) => void;
  answerStatus: ChatStatus;
  setAnswerStatus: (value: ChatStatus) => void;
  onAnswer: boolean;
  setOnAnswer: (value: boolean) => void;
  file: string;
  setFile: (file: string) => void;
  reset: () => void;
};

/* ---------- reducer ---------- */
const initialState: State = {
  userAnswers: [],
  assistantMessages: [],
  aiAnswer: "",
  answerStatus: "ready" as ChatStatus,
  onAnswer: false,
  file: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_USER_ANSWER":
      return { ...state, userAnswers: [...state.userAnswers, action.answer] };
    case "ADD_ASSISTANT_MESSAGE":
      return {
        ...state,
        assistantMessages: [...state.assistantMessages, action.msg],
      };
    case "SET_AI_ANSWER":
      return { ...state, aiAnswer: action.msg };
    case "SET_ANSWER_STATUS":
      return { ...state, answerStatus: action.value };
    case "SET_ON_ANSWER":
      return { ...state, onAnswer: action.value };
    case "SET_FILE":
      return { ...state, file: action.file };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

/* ---------- context ---------- */
const MessageContext = createContext<Ctx | undefined>(undefined);

/* ---------- provider ---------- */
export function MessageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addUserAnswer = useCallback(
    (answer: UserAnswer) => dispatch({ type: "ADD_USER_ANSWER", answer }),
    []
  );
  const addAssistantMessage = useCallback(
    (msg: string) => dispatch({ type: "ADD_ASSISTANT_MESSAGE", msg }),
    []
  );
  const setAiAnswer = useCallback(
    (msg: string) => dispatch({ type: "SET_AI_ANSWER", msg }),
    []
  );
  const setAnswerStatus = useCallback(
    (value: ChatStatus) => dispatch({ type: "SET_ANSWER_STATUS", value }),
    []
  );
  const setOnAnswer = useCallback(
    (value: boolean) => dispatch({ type: "SET_ON_ANSWER", value }),
    []
  );
  const setFile = useCallback(
    (file: string) => dispatch({ type: "SET_FILE", file }),
    []
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const currentUserMessage = useMemo(() => {
    const arr = state.userAnswers.map((val) => val.answer);
    return arr.length ? arr[arr.length - 1] : undefined;
  }, [state.userAnswers]);

  const currentAssistantMessage = useMemo(() => {
    const arr = state.assistantMessages;
    return arr.length ? arr[arr.length - 1] : undefined;
  }, [state.assistantMessages]);

  const value = useMemo<Ctx>(
    () => ({
      userAnswers: state.userAnswers,
      addUserAnswer,
      currentUserMessage,
      assistantMessages: state.assistantMessages,
      addAssistantMessage,
      currentAssistantMessage,
      aiAnswer: state.aiAnswer,
      setAiAnswer,
      answerStatus: state.answerStatus,
      setAnswerStatus,
      onAnswer: state.onAnswer,
      setOnAnswer,
      file: state.file,
      setFile,
      reset,
    }),
    [
      state.userAnswers,
      addUserAnswer,
      currentUserMessage,
      state.assistantMessages,
      addAssistantMessage,
      currentAssistantMessage,
      state.aiAnswer,
      setAiAnswer,
      state.answerStatus,
      setAnswerStatus,
      state.onAnswer,
      setOnAnswer,
      state.file,
      setFile,
      reset,
    ]
  );

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
}

/* ---------- hook ---------- */
export function useUserMessages() {
  const ctx = useContext(MessageContext);
  if (!ctx)
    throw new Error("useUserMessages must be used within <MessageProvider>");
  return ctx;
}
