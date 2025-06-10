import { Button } from "./ui/button";

const max = 6;

export const Navi: React.FC<{
  page: number;
  setPage: (updater: (prev: number) => number) => void;
}> = ({ page, setPage }) => {
  const handleNext = () => setPage((prev) => Math.min(max - 1, prev + 1));
  const handlePrev = () => setPage((prev) => Math.max(0, prev - 1));

  return (
    <div className="sticky top-0 z-10 px-12 py-4 flex items-center justify-between">
      <Button
        variant="link"
        onClick={handlePrev}
        disabled={page === 0}
        className="bg-white/40 hover:bg-white/80 rounded"
      >
        ＜ 前の問題
      </Button>
      <Button variant="outline" className="rounded">
        トップ画面に戻る
      </Button>
      <Button
        variant="link"
        onClick={handleNext}
        disabled={page === max - 1}
        className="bg-white/40 hover:bg-white/80 rounded"
      >
        次の問題 ＞
      </Button>
    </div>
  );
};
