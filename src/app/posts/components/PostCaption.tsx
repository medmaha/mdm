"use client";
import { useMemo, useState } from "react";
import { PostFeedsInterface } from "@/server/controllers/posts";

type Props = {
  time: string;
  caption: string;
  postType: FileType;
  mediaName?: string | null;
};

// Post Card for individual posts
export default function PostCaption({ caption, ...props }: Props) {
  //
  const [full, setFull] = useState(false);
  const canToggle = useMemo(() => caption.length >= 200, [caption]);

  function toggleCaption() {
    if (!canToggle) return;
    setFull((p) => !p);
  }

  const showMediaName = props.mediaName && props.postType !== "audio";

  return (
    <div
      className={`text-sm ${
        !showMediaName ? "flex" : ""
      } items-center justify-between px-2 py-2`}
    >
      {showMediaName && (
        <p className="pb-1">
          <span className="font-semibold">{props.mediaName}</span>
        </p>
      )}
      <p
        className={`${full ? "" : "line-clamp-2"} ${
          showMediaName ? "text-xs" : ""
        }`}
      >
        {caption}
      </p>
      {!showMediaName && props.postType === "audio" && (
        <p className="text-sm opacity-70">
          <small>
            <time>{props.time}</time>
          </small>
        </p>
      )}
      {canToggle && (
        <button onClick={toggleCaption} className="text-sky-600">
          view {full ? "less ..." : "more?"}
        </button>
      )}
    </div>
  );
}
