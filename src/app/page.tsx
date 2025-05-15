import { Chat } from "@/components/chat";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-zinc-900">
      <Header />
      <Chat />
      <Footer />
    </div>
  );
}
