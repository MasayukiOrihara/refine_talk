"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/hooks/useSessionId";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* 問題選択 */}
        <Card
          onClick={() => alert("クリックされました！")}
          className="w-[240px] cursor-pointer hover:shadow-lg transition"
        >
          {/* 開発 */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">💻 開発</CardTitle>
            <CardDescription>IT従事者向け 初級 全6問</CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              <li>1. 〇〇</li>
              <li>2. 〇〇</li>
              <li>3. 〇〇</li>
              <li>4. 〇〇</li>
              <li>5. 〇〇</li>
              <li>6. 〇〇</li>
            </ul>
          </CardContent>
          <CardFooter>
            <button className="w-full bg-indigo-500 hover:bg-indigo-800 hover:cursor-pointer text-white py-2 rounded-md">
              開始する
            </button>
          </CardFooter>
        </Card>

        <Card
          onClick={() => alert("クリックされました！")}
          className="cursor-pointer hover:shadow-lg transition"
        >
          {/* 保守・監視 */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🖥 保守・監視
            </CardTitle>
            <CardDescription>IT従事者向け 初級 全6問</CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              <li>1. 〇〇</li>
              <li>2. 〇〇</li>
              <li>3. 〇〇</li>
              <li>4. 〇〇</li>
              <li>5. 〇〇</li>
              <li>6. 〇〇</li>
            </ul>
          </CardContent>
          <CardFooter>
            <button className="w-full bg-indigo-500 hover:bg-indigo-800 hover:cursor-pointer text-white py-2 rounded-md">
              開始する
            </button>
          </CardFooter>
        </Card>

        <Card
          onClick={() => alert("クリックされました！")}
          className="cursor-pointer hover:shadow-lg transition"
        >
          {/* 製造業 */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🏭 製造業</CardTitle>
            <CardDescription>非IT従事者向け 初級 全6問</CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              <li>1. 〇〇</li>
              <li>2. 〇〇</li>
              <li>3. 〇〇</li>
              <li>4. 〇〇</li>
              <li>5. 〇〇</li>
              <li>6. 〇〇</li>
            </ul>
          </CardContent>
          <CardFooter>
            <button className="w-full bg-indigo-500 hover:bg-indigo-800 hover:cursor-pointer text-white py-2 rounded-md">
              開始する
            </button>
          </CardFooter>
        </Card>

        <Card
          onClick={() => alert("クリックされました！")}
          className="cursor-pointer hover:shadow-lg transition"
        >
          {/* 営業 */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">💼 営業</CardTitle>
            <CardDescription>非IT従事者向け 初級 全6問</CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              <li>1. 〇〇</li>
              <li>2. 〇〇</li>
              <li>3. 〇〇</li>
              <li>4. 〇〇</li>
              <li>5. 〇〇</li>
              <li>6. 〇〇</li>
            </ul>
          </CardContent>
          <CardFooter>
            <button className="w-full bg-indigo-500 hover:bg-indigo-800 hover:cursor-pointer text-white py-2 rounded-md">
              開始する
            </button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center text-muted-foreground mt-12">
        {/* 連絡欄 */}
        <p>連絡・要望は システム開発事業部 折原 まで</p>
        <a
          href="https://forms.gle/qb1hQybS4pRrae3r7"
          className="text-indigo-500 underline hover:text-indigo-800"
        >
          AI アンケートページ
        </a>
        <div className="flex flex-row justify-center text-zinc-400 text-sm pt-2 gap-4">
          <span>version: 0.5.2</span>
          <span>update: 2025-09-19</span>
        </div>
      </div>
    </div>
  );
};
