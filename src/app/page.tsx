import { Chat } from "@/components/chat";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SideMenu } from "@/components/side-menu";
import { Navi } from "@/components/navi-header";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <SideMenu />
        <main className="flex-1 flex flex-col">
          <Navi />
          <Chat />
          <Footer />
        </main>
      </div>
    </div>
  );
}
