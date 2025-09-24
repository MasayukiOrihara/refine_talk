import { FeatureLayout } from "@/components/layouts/featureLayout";
import { MarkdownLoader } from "@/components/contents/markdownLoader";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/parts/backButton";

export default async function Page(props: PageProps<"/play/intro/[slug]">) {
  const { slug } = await props.params;

  console.log(slug);
  return (
    <FeatureLayout>
      <div className="m-auto">
        <MarkdownLoader page={1} file={slug} />

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
