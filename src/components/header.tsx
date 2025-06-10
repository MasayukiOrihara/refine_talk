import React from "react";

export const Header: React.FC = () => {
  return (
    <div className="w-full max-w-screen-2xl top-0 z-10 p-2 flex bg-zinc-100 gap-4 shadow-md">
      <h1 className="text-xl text-zinc-300 font-host-grotesk font-extrabold">
        ヘッダーメニュー
      </h1>
    </div>
  );
};
