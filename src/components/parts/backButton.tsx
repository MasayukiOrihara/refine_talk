"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";

/**
 * 元のページに戻るボタン
 * @returns
 */
export default function BackButton() {
  const router = useRouter();

  return (
    <Button variant={"link"} onClick={() => router.back()}>
      <ChevronLeft className="h-4 w-4" />
      戻る
    </Button>
  );
}
