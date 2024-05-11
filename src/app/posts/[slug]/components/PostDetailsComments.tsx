"use client";
import { Loader2, SortAscIcon, SortDescIcon } from "lucide-react";
import { PostDetailInterface } from "@/server/controllers/posts";
import React, { useEffect, useState } from "react";
import { CommentItem } from "../../components/comments";

type Props = {
  user?: AuthUser;
  post: PostDetailInterface;
};

const commentsCached = new Map();
const defaultSort: "asc" | "desc" = "desc";

export default function PostDetailsComments({ user, post }: Props) {
  const [fetching, toggleFetching] = useState(false);
  const [comments, setComments] = useState(post?.comments);
  const [sort, setSort] = useState(defaultSort);

  useEffect(() => {
    commentsCached.set("sort", defaultSort);
    return () => {
      commentsCached.clear();
    };
  }, []);

  useEffect(() => {
    const newCommentEventHandler = (event: CustomEventInit) => {
      const comment = event.detail as any;
      const sort = commentsCached.get("sort") as typeof defaultSort;
      let _comments: any;
      if (commentsCached.has(post?.slug!)) {
        if (sort === "asc") {
          _comments = [comment, ...commentsCached.get(post?.slug!)!];
        } else {
          _comments = [...commentsCached.get(post?.slug!)!, comment];
        }
        setComments(_comments);
        commentsCached.set(post?.slug!, _comments);
      } else {
        if (sort === "asc") {
          setComments((prev) => {
            const data = [comment, ...(prev || [])];
            commentsCached.set(post?.slug!, data);
            return data;
          });
        } else {
          setComments((prev) => {
            const data = [...(prev || []), comment];
            commentsCached.set(post?.slug!, data);
            return data;
          });
        }
      }
    };
    document.addEventListener("new-comment", newCommentEventHandler);
    return () => {
      document.removeEventListener("new-comment", newCommentEventHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortComments = () => {
    let sortType: typeof sort;
    if (sort === "asc") {
      sortType = "desc";
    } else {
      sortType = "asc";
    }

    let sortedComments: typeof comments;

    if (sort === "asc") {
      sortedComments = comments?.sort(
        (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()
      );
    } else {
      sortedComments = comments?.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    }

    setSort(sortType);
    setComments([...sortedComments!]);
    commentsCached.set("sort", sortType);
  };

  return (
    <>
      <div className="flex border-b py-1 items-center justify-between">
        {comments && comments.length > 0 && (
          <>
            <h4 className="text-sm dark:opacity-90">
              Comments {comments && comments.length}
            </h4>
            <div className="flex items-center h-full">
              <button
                onClick={sortComments}
                className="hover:bg-gray-500/30 hover:border-gray-500/60 transition border border-transparent p-0.5 rounded-full"
              >
                {sort === "desc" && <SortAscIcon className="w-4 h-4" />}
                {sort === "asc" && <SortDescIcon className="w-4 h-4" />}
              </button>
            </div>
          </>
        )}
        {!!(!comments || comments.length === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <h4 className="text-sm dark:opacity-90">No Comments</h4>
          </div>
        )}
      </div>
      {fetching && (
        <div className="pt-6 justify-center items-center flex">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      {comments && !comments.length && (
        <div className="p-4 w-full">
          <div className="flex items-center mt-4 justify-center flex-col gap-2">
            <p className="text-xs opacity-80 font-semibold">
              Be the first to comment!
            </p>
          </div>
        </div>
      )}
      {comments &&
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} user={user} />
        ))}
    </>
  );
}
