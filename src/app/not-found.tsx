import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] grid place-items-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">ページが見つかりません（404）</h1>
        <p className="text-muted-foreground">
          入力したURLが間違っているか、ページが削除された可能性があります。
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button>トップへ戻る</Button>
          </Link>
          <Link href="/play">
            <Button variant="outline">シナリオ一覧へ</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
