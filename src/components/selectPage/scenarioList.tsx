import Link from "next/link";
import * as C from "@/components/ui/card";
import { Button } from "../ui/button";
import { INTRO_PATH } from "@/lib/api/path";
import { scenarios } from "@/lib/contents/scenarios";

// リストの表示数
const maxLength = 2;

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
