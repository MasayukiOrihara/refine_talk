"use client";

/**
 * レンダリングエラーテスト用のダミーコンポーネント
 * @returns
 */
export function BuggyComponent() {
  throw new Error("テスト用エラー: BuggyComponent 爆発しました 🚨");

  return <div>これは表示されない</div>;
}
