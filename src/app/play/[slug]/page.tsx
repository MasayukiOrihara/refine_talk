import { Markdown } from "@/components/contents/markdown";
import BackButton from "@/components/parts/backButton";
import { Footer } from "@/components/parts/footer";
import { Header } from "@/components/parts/header";
import { SideMenu } from "@/components/parts/side-menu";
import { Button } from "@/components/ui/button";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  console.log(slug);
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <SideMenu />
        <main className="flex-1 flex flex-col">
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
          <Footer />
        </main>
      </div>
    </div>
  );
}
