"use client";

import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

/**
 * UIコンポーネントのエラーを検知する
 * エラーページの表示
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  // レンダリング中に子コンポーネントでエラーが投げられたら呼ばれる特別メソッド
  static getDerivedStateFromError(err: unknown): State {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : String(err),
    };
  }

  // エラーログ取得
  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // TODO: ログ送信（Sentry など）
    console.error("UI Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center m-4 rounded-lg border bg-red-50 p-4 text-sm text-red-700">
          <h1>予期せぬエラーが発生しました。</h1>
          <div>
            <h2 className="text-xs">詳細: </h2>
            <p>
              {process.env.NODE_ENV === "development" && (
                <code className="block mt-2 text-xs">{this.state.message}</code>
              )}
            </p>
          </div>
          <button
            className="mt-3 rounded bg-red-600 px-3 py-1 text-white"
            onClick={() => location.reload()}
          >
            画面を再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
