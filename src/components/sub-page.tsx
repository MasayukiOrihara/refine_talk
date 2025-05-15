import { Chat } from "./contents/chat";
import { Question } from "./contents/question";

export const SubPage: React.FC = () => (
  <div className="mt-2 flex flex-col md:flex-row w-full max-w-7xl h-full mx-auto gap-2 overflow-hidden">
    <Question />
    <Chat />
  </div>
);
