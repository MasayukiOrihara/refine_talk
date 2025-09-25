import { useChat } from "@ai-sdk/react";

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

/**
 * supabase error log 関連で使う型
 */

/** 自作 json 型 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/** エラーログを supabase へ送るときの型 */
export type ErrorLogsPayload = {
  id: string; // uuid（クライアント発行をそのまま）
  session_id?: string | null; // uuid（任意）
  message: string; // NOT NULL
  name?: string | null;
  stack?: string | null;
  component_stack?: string | null;
  detail?: Json | null; // jsonb
  severity?: string | null;
  tags?: string[] | null; // text[]
  occurred_at?: string | null; // ISO文字列 "2025-09-17T12:34:56.789Z"
  received_at?: string | null; // 省略推奨（DBの default now() を使う）
  user_agent?: string | null;
  url?: string | null;
  hash?: string | null;
};
