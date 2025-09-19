import { Footer } from "../parts/footer";
import { Header } from "../parts/header";
import { SideMenu } from "../parts/side-menu";

type Props = {
  children: React.ReactNode;
};

export const FeatureLayout = ({ children }: Props) => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <SideMenu />
        <main className="flex-1 flex flex-col">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};
