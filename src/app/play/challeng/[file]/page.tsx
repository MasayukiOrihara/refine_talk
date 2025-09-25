import { FeatureLayout } from "@/components/layouts/featureLayout";
import { Answer } from "@/components/contents/answer";
import { MarkdownLoader } from "@/components/contents/markdownLoader";
import { Chat } from "@/components/contents/chat";
import { Navi } from "@/components/parts/navi-header";

export default async function Page(props: PageProps<"/play/challeng/[file]">) {
  const { file } = await props.params;

  return (
    <FeatureLayout>
      <div className="flex flex-col xl:flex-row h-full mx-auto gap-2 overflow-hidden">
        {/** todo: navi を追加する */}
        <MarkdownLoader file={file} />
        <Answer />
        <Chat file={file} />
      </div>
    </FeatureLayout>
  );
}
