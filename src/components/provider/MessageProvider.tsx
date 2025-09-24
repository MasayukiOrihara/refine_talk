"use client";

import { useChat } from "@ai-sdk/react";
import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
  ReactNode,
} from "react";

/* ---------- types ---------- */
type ChatStatus = ReturnType<typeof useChat>["status"];
type State = {
  userMessages: string[];
  aiMessage: string;
  answerStatus: ChatStatus;
  onAnswer: boolean;
  page: string;
};

type Action =
  | { type: "ADD_USER_MESSAGE"; msg: string }
  | { type: "SET_AI_MESSAGE"; msg: string }
  | { type: "SET_ANSWER_STATUS"; value: ChatStatus }
  | { type: "SET_ON_ANSWER"; value: boolean }
  | { type: "SET_PAGE"; page: string }
  | { type: "RESET" };

type Ctx = {
  userMessages: string[];
  addUserMessage: (msg: string) => void;
  currentUserMessage: string | undefined;
  aiMessage: string;
  setAiMessage: (msg: string) => void;
  answerStatus: ChatStatus;
  setAnswerStatus: (value: ChatStatus) => void;
  onAnswer: boolean;
  setOnAnswer: (value: boolean) => void;
  page: string;
  setPage: (page: string) => void;
  reset: () => void;
};

/* ---------- reducer ---------- */
const initialState: State = {
  userMessages: [],
  aiMessage: "",
  answerStatus: "ready" as ChatStatus,
  onAnswer: false,
  page: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_USER_MESSAGE":
      return { ...state, userMessages: [...state.userMessages, action.msg] };
    case "SET_AI_MESSAGE":
      return { ...state, aiMessage: action.msg };
    case "SET_ANSWER_STATUS":
      return { ...state, answerStatus: action.value };
    case "SET_ON_ANSWER":
      return { ...state, onAnswer: action.value };
    case "SET_PAGE":
      return { ...state, page: action.page };
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

  const addUserMessage = useCallback(
    (msg: string) => dispatch({ type: "ADD_USER_MESSAGE", msg }),
    []
  );
  const setAiMessage = useCallback(
    (msg: string) => dispatch({ type: "SET_AI_MESSAGE", msg }),
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
  const setPage = useCallback(
    (page: string) => dispatch({ type: "SET_PAGE", page }),
    []
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const currentUserMessage = useMemo(() => {
    const arr = state.userMessages;
    return arr.length ? arr[arr.length - 1] : undefined;
  }, [state.userMessages]);

  const value = useMemo<Ctx>(
    () => ({
      userMessages: state.userMessages,
      addUserMessage,
      currentUserMessage,
      aiMessage: state.aiMessage,
      setAiMessage,
      answerStatus: state.answerStatus,
      setAnswerStatus,
      onAnswer: state.onAnswer,
      setOnAnswer,
      page: state.page,
      setPage,
      reset,
    }),
    [
      state.userMessages,
      addUserMessage,
      currentUserMessage,
      state.aiMessage,
      setAiMessage,
      state.answerStatus,
      setAnswerStatus,
      state.onAnswer,
      setOnAnswer,
      state.page,
      setPage,
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
