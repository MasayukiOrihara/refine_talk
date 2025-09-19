"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/hooks/useSessionId";

import ScenarioList from "./scenarioList";
import { Button } from "../ui/button";

export const SelectPage: React.FC = () => {
  // ここで session ID を初期化
  const { init } = useSessionStore();
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex flex-col items-center w-full md:w-4xl h-full m-auto ">
      <div className="flex flex-col items-center px-4 py-8 gap-0.5">
        {/* タイトル */}

        <h1 className="text-2xl font-bold">シチュエーションカリキュラム</h1>
        <p className="text-muted-foreground mt-2">
          報連相を実践的に学ぶビジネススキル学習アプリ
        </p>
        <div className="my-4">
          <p>
            AIがその場で採点し、反復練習が可能。1シナリオ6問・約20分で完了！
          </p>
        </div>
      </div>

      {/* 問題選択 */}
      <ScenarioList />

      <div className="w-full text-center text-muted-foreground py-2 mt-12 mb-2 bg-zinc-200 rounded">
        {/* 連絡欄 */}
        <p>連絡・要望は システム開発事業部 折原 まで</p>
        <Button asChild variant="link" className="mt-[-6px]">
          <a
            href="https://forms.gle/qb1hQybS4pRrae3r7"
            target="_blank"
            rel="noopener noreferrer"
          >
            AI アンケート（Googleフォーム）
          </a>
        </Button>
      </div>
    </div>
  );
};
