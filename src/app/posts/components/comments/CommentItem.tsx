"use client";
import { ImageIcon, Mic, User2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import TextComment from "../TextComment";
import VoiceComment from "../VoiceComment";
import { format } from "date-fns";
import { CommentListInterface } from "@/server/controllers/comments";
import Textarea from "@/app/components/UI/Textarea";
import ReplyItem from "./ReplyItem";
import { makeCommentReply, makeLike } from "../actions";
import toast from "react-hot-toast";

type CommentProps = {
  user?: AuthUser;
  comment: CommentListInterface[0];
};

export default function CommentItem({ comment: data, user }: CommentProps) {
  const [comment, setComment] = useState(data);
  const [reply, toggleReply] = useState(false);
  const [liked, toggleLiked] = useState(false);
  const [counts, setCounts] = useState({
    likes: data.likesCount,
    replies: data.repliesCount,
  });
  const [submitting, toggleSubmitting] = useState(false);

  // Submit the comment reply to the server
  const submitReply = async (textarea: HTMLTextAreaElement) => {
    if (submitting) return;

    // Data to be sent to the server
    const data = {
      text: textarea.value,
      comment_type: "text",
      parent_id: comment.id,
      post_slug: comment.postSlug,
    };

    toggleSubmitting(true);

    // Create a form-data
    const formData = new FormData();

    // Add the data properties to the form-data
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    // Optimistically update the comment reply counts
    setCounts((prev) => ({ ...prev, replies: (prev.replies || 0) + 1 }));
    const response = await makeCommentReply(formData);
    toggleSubmitting(false);

    // If there was an error
    if (!response.success) {
      // reverts the optimistic update
      setCounts((prev) => ({ ...prev, replies: (prev.replies || 1) - 1 }));

      // display the error
      return toast.error(response.message, { duration: 5_000 });
    }

    // Clear the reply textarea
    textarea.value = "";

    // Construct the reply and add the current user as the author
    const reply = {
      ...response.data,
      author: {
        name: user!.name,
        avatar: user!.avatar,
        username: user!.username,
      },
    };

    // Add the reply to the comment replies
    setComment((prev) => {
      const replies = prev.replies || [];

      // Insert the reply at the first position
      replies.unshift(reply);

      // FIXME: This should be done in a better way
      // Remove the reply from the cache
      let cleanedReplies = {} as { [key: string]: (typeof replies)[0] };
      replies.forEach((reply) => {
        cleanedReplies[reply.id] = reply;
      });

      // Construct the new data
      const data = {
        ...prev,
        replies: Object.values(cleanedReplies),
      };

      // Dispatch the event to update this posts comments cache
      const event = new CustomEvent("cache-post-comments", {
        detail: { commentId: comment.id, data: data },
      });
      document.dispatchEvent(event);

      return data;
    });

    // Notify the user that the reply was created
    toggleReply(false);
    toast.success("Reply created successfully", {
      duration: 5_000,
      position: "bottom-left",
    });

    // Dispatch the event to increment the post interaction counts
    const event = new CustomEvent("increment-post-interaction-counts", {
      detail: { type: "comment" },
    });
    document.dispatchEvent(event);
  };

  // Like or unlike the comment
  const toggleLike = async () => {
    // Get the current interaction states
    const likedSnapshot = liked;
    const countSnapshot = counts.likes || 0;

    try {
      // Optimistically update the interaction states
      toggleLiked((prev) => !prev);
      setCounts((prev) => {
        return {
          ...prev,
          likes: countSnapshot + (likedSnapshot ? -1 : 1),
        };
      });

      // Send the request
      const response = await makeLike({
        objectId: String(comment.id),
        objectType: "comments",
      });

      // If an error occurred
      if (!response.success) {
        // throw an error with the response message
        throw new Error(response.message);
      }
    } catch ({ message }: any) {
      // Revert the optimistic updates
      toggleLiked(likedSnapshot);
      setCounts((prev) => {
        return {
          ...prev,
          likes: countSnapshot,
        };
      });
      toast.error(message, { duration: 5_000 });
    }
  };

  return (
    <div className={`flex flex-col gap-1`}>
      <div key={comment.id} className="last:border-none border-b pt-2 pb-1">
        <Link
          href={`/${comment.author?.username}`}
          className="flex items-center space-x-2 w-max"
        >
          <div className="flex w-8 h-8 border rounded-full overflow-hidden">
            {comment.author?.avatar && (
              <Image
                width={32} // Set width and height to maintain aspect ratio
                height={32}
                src={comment.author.avatar}
                alt="avatar"
                className="w-full h-full rounded-full comment-author-img"
              />
            )}
            {!comment.author?.avatar && (
              <div className="h-full w-full dark:bg-black/30 flex items-center justify-center">
                <User2 width={28} height={28} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-xs">{comment.author?.name}</p>
            <p className="text-xs opacity-70">@{comment.author?.username}</p>
          </div>
        </Link>
        {comment.commentType === "text" && (
          <div className="space-y-1 mt-2">
            <TextComment
              text={comment.text!}
              replied={false}
              liked={liked}
              toggleLike={toggleLike}
              toggleReply={() => toggleReply((p) => !p)}
            />
            <CommentDate comment={comment} counts={counts} />
          </div>
        )}
        {comment.commentType === "image" && <div className="">Image</div>}
        {comment.commentType === "audio" && (
          <div className="mt-2 space-y-1">
            <VoiceComment
              src={comment.fileUrl!}
              replied={false}
              liked={liked}
              toggleLike={toggleLike}
              toggleReply={() => toggleReply((p) => !p)}
            />
            <CommentDate comment={comment} counts={counts} />
          </div>
        )}
        {reply && (
          <div className="my-2 relative ml-8">
            <Textarea
              rows={1}
              autoFocus
              placeholder={`Reply to ${comment.author?.name.toLowerCase()}...`}
              className="min-h-[30px] pr-[60px] text-sm"
              onKeyDown={(e) => {
                e.key === "Enter" && submitReply(e.currentTarget);
                e.key === "Escape" && toggleReply((p) => !p);

                if (e.key === "Enter" || e.key === "Escape") e.preventDefault();
              }}
            />
            <div className="absolute w-[60px] right-0 bottom-2">
              <div className="flex items-center gap-1">
                <button className="p-1.5 transition-all opacity-90 hover:opacity-100 dark:hover:bg-gray-700 hover:bg-gray-500 rounded-full">
                  <Mic width={16} height={16} />
                </button>
                <button className="p-1.5 transition-all opacity-90 hover:opacity-100 dark:hover:bg-gray-700 hover:bg-gray-500 rounded-full">
                  <ImageIcon width={16} height={16} />
                </button>
              </div>
            </div>
            {submitting && (
              <div className="absolute bottom-0 left-0 w-[calc(100%-36px)] overflow-hidden rounded-b-md">
                <div className="animate-translate-left-and-right h-[2px] rounded shadow bg-primary"></div>
              </div>
            )}
          </div>
        )}
        {comment.replies?.length > 0 &&
          comment.replies.map((reply: any) => (
            <ReplyItem key={reply.id} comment={reply} />
          ))}
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
        <p>
          <small>
            Replies <b>{counts.replies}</b>
          </small>
        </p>
      </div>
    </div>
  );
}
