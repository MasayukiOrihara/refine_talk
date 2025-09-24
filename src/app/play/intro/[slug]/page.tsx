import { FeatureLayout } from "@/components/layouts/featureLayout";
import { MarkdownLoader } from "@/components/contents/markdownLoader";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/parts/backButton";
import Link from "next/link";
import { scenarios } from "@/lib/contents/scenarios";
import { notFound } from "next/navigation";

const CHALLENG_PATH = "/play/challeng/";

export default async function Page(props: PageProps<"/play/intro/[slug]">) {
  const { slug } = await props.params;

  console.log(slug);

  const target = scenarios.find((s) => s.slug === slug);
  const file = target?.file?.[0];
  if (!file) notFound(); // 404エラー
  console.log(file);
  return (
    <FeatureLayout>
      <div className="m-auto">
        <MarkdownLoader page={1} file={slug} />

        {/* 遷移ボタン */}
        <div className="flex justify-center gap-12">
          <BackButton />
          {target && (
            <Link key={file} href={`${CHALLENG_PATH}${file}`}>
              <Button className="bg-indigo-500 hover:bg-indigo-800 px-12">
                問題を開始する
              </Button>
            </Link>
          )}
        </div>
      </div>
    </FeatureLayout>
  );
}
