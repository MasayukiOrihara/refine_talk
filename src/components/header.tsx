import { Dog } from "lucide-react";
import { Button } from "./ui/button";
import React from "react";

export const Header: React.FC = () => {
  return (
    <div className="sticky top-0 z-10 p-4 flex items-center justify-center gap-4 bg-zinc-900/90 shadow-md">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-row items-center gap-2">
          <Dog className="text-white" />
          <h1 className="text-xl text-white font-host-grotesk font-extrabold">
            RAGGER AI
          </h1>
        </div>

        <div className="flex flex-row items-center gap-6">
          <Button className="bg-blue-500 px-3 py-1 rounded">
            トップ画面に戻る
          </Button>
          <Button className="bg-blue-500 px-3 py-1 rounded">更新</Button>
        </div>
      </div>
    </div>
  );
};
