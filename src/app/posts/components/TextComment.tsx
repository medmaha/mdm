"use client";
import { Forward, ThumbsUp } from "lucide-react";

type Props = {
  text: string;
  liked: boolean;
  replied: boolean;
  toggleLike: () => Promise<void>;
  toggleReply?: () => void;
};

export default function TextComment({ text, toggleReply, ...props }: Props) {
  return (
    <>
      <div className="dark:bg-black/20 p-0.5 bg-gray-400 rounded-3xl w-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 flex items-center gap-2">
            <p className="text-xs p-2">{text || "No content provided"}</p>
          </div>
          <div className="flex items-center self-end h-8 pr-2 gap-2">
            <button
              onClick={props.toggleLike}
              className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
            >
              <ThumbsUp width={16} height={16} />
            </button>
            {toggleReply && (
              <button
                onClick={toggleReply}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
              >
                <Forward width={16} height={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
