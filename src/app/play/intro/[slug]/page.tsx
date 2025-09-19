import { FeatureLayout } from "@/components/layouts/featureLayout";
import { Markdown } from "@/components/contents/markdown";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/parts/backButton";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  console.log(slug);
  return (
    <FeatureLayout>
      <div className="m-auto">
        <Markdown page={1} file={slug} />

        {/* 遷移ボタン */}
        <div className="flex justify-center gap-12">
          <BackButton />
          <Button className=" bg-indigo-500 hover:bg-indigo-800 px-12">
            問題を開始する
          </Button>
        </div>
      </div>
    </FeatureLayout>
  );
}
