"use client";
import { User2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import TextComment from "../TextComment";
import VoiceComment from "../VoiceComment";
import { format } from "date-fns";
import { CommentListReplyInterface } from "@/server/controllers/comments";
import { makeLike } from "../actions";
import toast from "react-hot-toast";

type CommentProps = {
  comment: CommentListReplyInterface;
};

export default function ReplyItem({ comment: data }: CommentProps) {
  const [reply, setComment] = useState(data);
  const [liked, toggleLiked] = useState(false);
  const [counts, setCounts] = useState({
    likes: data.likesCount,
  });

  // Toggle the like status of a comment reply.
  const toggleLike = async () => {
    const likedSnapshot = liked; // Save the current like status
    const countSnapshot = counts.likes || 0; // Save the current like count
    try {
      // Optimistically update the like count and like status
      toggleLiked((prev) => !prev);
      setCounts((prev) => {
        return {
          ...prev,
          likes: countSnapshot + (likedSnapshot ? -1 : 1),
        };
      });

      // Send a request to the server to update the like count
      const response = await makeLike({
        objectId: String(reply.id),
        objectType: "replies",
      });

      // Throw an error if the request fails
      if (!response.success) throw new Error(response.message);
    } catch ({ message }: any) {
      // If the request fails, revert the like count and like status
      toggleLiked((prev) => !prev);
      setCounts((prev) => {
        return {
          ...prev,
          likes: countSnapshot,
        };
      });
      toast.error(message, { duration: 5_000 }); // Display an error message
    }
  };

  return (
    <div className={`flex flex-col gap-1 pl-8`}>
      <div key={reply.id} className="last:border-none border-t pt-2 pb-1">
        <Link
          href={`/${reply.author?.username}`}
          className="flex items-center space-x-2 w-max"
        >
          <div className="flex w-8 h-8 border rounded-full overflow-hidden">
            {reply.author?.avatar && (
              <Image
                width={32} // Set width and height to maintain aspect ratio
                height={32}
                src={reply.author.avatar}
                alt="avatar"
                className="w-full h-full rounded-full comment-author-img"
              />
            )}
            {!reply.author?.avatar && (
              <div className="h-full w-full dark:bg-black/30 flex items-center justify-center">
                <User2 width={28} height={28} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-xs">{reply.author?.name}</p>
            <p className="text-xs opacity-70">@{reply.author?.username}</p>
          </div>
        </Link>
        {reply.commentType === "text" && (
          <div className="space-y-1 mt-2">
            <TextComment
              text={reply.text!}
              replied={false}
              liked={liked}
              toggleLike={toggleLike}
            />
            <CommentDate comment={reply} counts={counts} />
          </div>
        )}
        {reply.commentType === "image" && <div className="">Image</div>}
        {reply.commentType === "audio" && (
          <div className="mt-2 space-y-1">
            <VoiceComment
              src={reply.fileUrl!}
              replied={false}
              liked={liked}
              toggleLike={toggleLike}
            />
            <CommentDate comment={reply} counts={counts} />
          </div>
        )}
      </div>
    </div>
  );
}

function CommentDate({ comment, counts }: any) {
  return (
    <div className="text-xs gap-2 text-nowrap opacity-60 flex justify-between">
      <p className="text-nowrap pl-2 flex justify-between">
        <small>
          {format(new Date(comment.updatedAt), "PPp", {
            firstWeekContainsDate: 4,
            weekStartsOn: 5,
          })}
        </small>
      </p>
      <div className="flex items-center gap-4 pr-2">
        <p>
          <small>
            Likes <b>{counts.likes}</b>
          </small>
        </p>
      </div>
    </div>
  );
}
