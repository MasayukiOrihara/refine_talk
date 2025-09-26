"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { scenarios } from "@/lib/contents/scenarios";

export const Navi: React.FC<{ file: string }> = ({ file }) => {
  const [page, setPage] = useState(0);

  // ファイル名からページ数を特定
  const files = findFilePosition(file)?.files ?? [];
  const max = files.length;
  const nowPageIndex = findFilePosition(file)?.position ?? 0;

  useEffect(() => {
    setPage(nowPageIndex);
  }, [nowPageIndex]);

  const handleNext = () => setPage((prev) => Math.min(max - 1, prev + 1));
  const handlePrev = () => setPage((prev) => Math.max(0, prev - 1));

  return (
    <div className="sticky top-0 z-10 px-12 py-4 flex items-center justify-between">
      <div>
        <Link href={page !== 0 ? files[page - 1] : files[page]}>
          <Button
            variant="link"
            onClick={handlePrev}
            disabled={page === 0}
            className="bg-white/40 hover:bg-white/80 rounded"
          >
            ＜ 前の問題
          </Button>
        </Link>
      </div>

      {/** トップへ戻るボタン */}
      <div>
        <Link href="/">
          <Button variant="outline" className="rounded">
            トップ画面に戻る
          </Button>
        </Link>
      </div>

      <div>
        <Link href={page < max - 1 ? files[page + 1] : files[page]}>
          <Button
            variant="link"
            onClick={handleNext}
            disabled={page === max - 1}
            className="bg-white/40 hover:bg-white/80 rounded"
          >
            次の問題 ＞
          </Button>
        </Link>
      </div>
    </div>
  );
};

/**
 * file名からポジションとfile名を取得する
 * @param fileName
 * @returns
 */
function findFilePosition(fileName: string) {
  for (const scenario of scenarios) {
    const index = scenario.file.indexOf(fileName);
    if (index !== -1) {
      return {
        files: scenario.file,
        position: index, // 0始まり
      };
    }
  }
  return null; // 見つからなかった場合
}
