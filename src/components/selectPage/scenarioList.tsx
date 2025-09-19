import Link from "next/link";
import * as C from "@/components/ui/card";
import { Button } from "../ui/button";

const scenarios = [
  {
    slug: "it_dev-intro.md",
    title: "💻 開発 新人",
    description: "IT従事者向け 初級 全6問",
    contents: [
      "進捗の報告",
      "不具合修正の報告",
      "仕様変更の共有",
      "ﾘﾘｰｽｽｹｼﾞｭｰﾙの共有",
      "設計用の判断に迷う場面",
      "納期調整の相談",
    ],
  },
  {
    slug: "it_ops-intro.md",
    title: "🖥 保守・監視 新人",
    description: "IT従事者向け 初級 全6問",
    contents: [
      "障害発生の報告",
      "定期ﾒﾝﾃﾅﾝｽ結果の報告",
      "ｼｽﾃﾑ停止予定の共有",
      "ｾｷｭﾘﾃｨパッチ適用の共有",
      "障害復旧対応の相談",
      "ﾘｿｰｽ増強の相談",
    ],
  },
  {
    slug: "mfg-intro.md",
    title: "🏭 製造業 新人",
    description: "非IT従事者向け 初級 全6問",
    contents: [
      "品質検査の結果",
      "ﾄﾗﾌﾞﾙ報告",
      "工程変更の共有",
      "安全情報の共有",
      "品質異常への対応",
      "設備ﾄﾗﾌﾞﾙ時の判断",
    ],
  },
  {
    slug: "sales-intro.md",
    title: "💼 営業 新人",
    description: "非IT従事者向け 初級 全6問",
    contents: [
      "商談結果の報告",
      "目標進捗の報告",
      "顧客訪問予定の共有",
      "契約条件変更の共有",
      "クレーム対応の相談",
      "値引き交渉の相談",
    ],
  },
];

// リストの表示数
const maxLength = 2;
const INTRO_PATH = "/play/intro/";

export default function ScenarioList() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {scenarios.map((s) => (
        <Link key={s.slug} href={`${INTRO_PATH}${s.slug}`}>
          <C.Card className="w-[240px] cursor-pointer hover:shadow-lg transition">
            <C.CardHeader className="pb-1">
              <C.CardTitle className="flex items-center text-xl gap-2">
                {s.title}
              </C.CardTitle>
              <C.CardDescription>{s.description}</C.CardDescription>
            </C.CardHeader>
            <C.CardContent className="pt-1">
              <ul className="text-sm leading-6 space-y-1">
                {s.contents.slice(0, maxLength).map((arr, index) => {
                  const num = String.fromCharCode(0x2460 + index);
                  return (
                    <li key={index}>
                      {num} {arr}
                    </li>
                  );
                })}
                {s.contents.length > maxLength && (
                  <li className="text-muted-foreground">
                    …（他 {s.contents.length - maxLength} 問）
                  </li>
                )}
              </ul>
            </C.CardContent>
            <C.CardFooter>
              <Button className="w-full bg-indigo-500 hover:bg-indigo-800">
                開始する
              </Button>
            </C.CardFooter>
          </C.Card>
        </Link>
      ))}
    </div>
  );
}
