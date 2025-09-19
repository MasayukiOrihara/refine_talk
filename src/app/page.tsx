import { Header } from "@/components/parts/header";
import { Footer } from "@/components/parts/footer";
import { SideMenu } from "@/components/parts/side-menu";
import { SelectPage } from "@/components/selectPage/selectPage";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <SideMenu />
        <main className="flex-1 flex flex-col">
          <SelectPage />
          <Footer />
        </main>
      </div>
    </div>
  );
}
