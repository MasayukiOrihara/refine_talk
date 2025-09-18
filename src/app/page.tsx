import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SideMenu } from "@/components/side-menu";
import { SubPage } from "@/components/sub-page";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <SideMenu />
          <main className="flex-1 flex flex-col">
            <SubPage />
            <Footer />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
