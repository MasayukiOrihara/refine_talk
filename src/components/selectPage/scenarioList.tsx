import Link from "next/link";
import * as C from "@/components/ui/card";

const scenarios = [
  {
    slug: "it_dev-intro.md",
    title: "💻 開発 新人",
    description: "IT従事者向け 初級 全6問",
    contents: ["〇〇", "〇〇", "〇〇", "〇〇", "〇〇", "〇〇"],
  },
  {
    slug: "it_ops-intro.md",
    title: "🖥 保守・監視 新人",
    description: "IT従事者向け 初級 全6問",
    contents: ["〇〇", "〇〇", "〇〇", "〇〇", "〇〇", "〇〇"],
  },
  {
    slug: "mfg-intro.md",
    title: "🏭 製造業 新人",
    description: "非IT従事者向け 初級 全6問",
    contents: ["〇〇", "〇〇", "〇〇", "〇〇", "〇〇", "〇〇"],
  },
  {
    slug: "sales-intro.md",
    title: "💼 営業 新人",
    description: "非IT従事者向け 初級 全6問",
    contents: ["〇〇", "〇〇", "〇〇", "〇〇", "〇〇", "〇〇"],
  },
];

export default function ScenarioList() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {scenarios.map((s) => (
        <Link key={s.slug} href={`/play/${s.slug}`}>
          <C.Card className="w-[240px] cursor-pointer hover:shadow-lg transition">
            <C.CardHeader>
              <C.CardTitle className="flex items-center text-xl gap-2">
                {s.title}
              </C.CardTitle>
              <C.CardDescription>{s.description}</C.CardDescription>
            </C.CardHeader>
            <C.CardContent>
              <ul>
                {s.contents.map((arr, index) => (
                  <li key={index + arr}>
                    {index + 1}. {arr}
                  </li>
                ))}
              </ul>
            </C.CardContent>
            <C.CardFooter>
              <button className="w-full bg-indigo-500 hover:bg-indigo-800 hover:cursor-pointer text-white py-2 rounded-md">
                開始する
              </button>
            </C.CardFooter>
          </C.Card>
        </Link>
      ))}
    </div>
  );
}
