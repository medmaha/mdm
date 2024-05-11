import { Loader2, SortAscIcon, SortDescIcon } from "lucide-react";
import { CommentListInterface } from "@/server/controllers/comments";
import { PostFeedsInterface } from "@/server/controllers/posts";
import React, { useEffect, useState } from "react";
import { getComments } from "./actions";
import { CommentItem } from "./comments";
import ClientCaching from "@/lib/utils/caching";
import toast from "react-hot-toast";

type Props = {
  user?: AuthUser;
  detailPage?: boolean;
  post: PostFeedsInterface;
};

const commentsCached = ClientCaching<CommentListInterface>("1m");
const defaultSort: "asc" | "desc" = "desc";

function getCommentCount(comments: CommentListInterface) {
  return comments.reduce((acc, cur) => acc + (1 + cur.replies?.length || 0), 0);
}

export default function CommentsWrapper({ user, post, ...props }: Props) {
  const [fetching, toggleFetching] = useState(false);
  const [comments, setComments] = useState<CommentListInterface>();
  const [count, setCount] = useState(
    comments?.length || post.commentsCount || 0
  );
  const [sort, setSort] = useState(defaultSort);

  useEffect(() => {
    commentsCached.set("sort", defaultSort);

    const cachePostComments = (event: CustomEventInit) => {
      const comment = event.detail.data;
      const commentId = event.detail.commentId;
      const _comment = comments?.reduce((acc, cur) => {
        if (cur.id === commentId) {
          acc.push(comment);
        } else {
          acc.push(cur);
        }
        return acc;
      }, [] as typeof comments);

      commentsCached.set(post.slug!, _comment);
    };

    const incrementPostInteractionCount = (event: CustomEventInit) => {
      const type = event.detail.type as "like" | "comment";
      switch (type) {
        case "comment":
          setCount((p) => p + 1);
          break;
        default:
          break;
      }
    };

    const newCommentEventHandler = (event: CustomEventInit) => {
      const comment = event.detail as any;
      const sort = commentsCached.get("sort") as typeof defaultSort;
      let _comments: any;
      if (commentsCached.has(post.slug!)) {
        if (sort === "asc") {
          _comments = [comment, ...commentsCached.get(post.slug!, [])!];
        } else {
          _comments = [...commentsCached.get(post.slug!, [])!, comment];
        }
        setComments(_comments);
        commentsCached.set(post.slug!, _comments);
      } else {
        if (sort === "asc") {
          setComments((prev) => {
            const data = [comment, ...(prev || [])];
            commentsCached.set(post.slug!, data);
            return data;
          });
        } else {
          setComments((prev) => {
            const data = [...(prev || []), comment];
            commentsCached.set(post.slug!, data);
            return data;
          });
        }
      }
      setCount((p) => p + 1);
    };

    document.addEventListener("new-comment", newCommentEventHandler);

    document.addEventListener(
      "increment-post-interaction-counts",
      incrementPostInteractionCount
    );
    document.addEventListener("cache-post-comments", cachePostComments);
    return () => {
      commentsCached.clear();
      document.removeEventListener(
        "increment-post-interaction-counts",
        incrementPostInteractionCount
      );
      document.removeEventListener("new-comment", newCommentEventHandler);
      document.removeEventListener("cache-post-comments", cachePostComments);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      toggleFetching(true);
      try {
        if (commentsCached.has(post.slug!)) {
          const data = commentsCached.get(post.slug!, [])!;
          setComments(data);
          setCount(getCommentCount(data));
          toggleFetching(false);
          return;
        }
        const response = await getComments<CommentListInterface>(post.slug!);
        if (response.success) {
          setComments(response.data);
          commentsCached.set(post.slug!, response.data);
          setCount(getCommentCount(response.data));
        }
        toggleFetching(false);
      } catch (error: any) {
        toggleFetching(false);
        toast.error(error.message, { duration: 5_000 });
      }
    };
    fetchData();

    return () => {};
  }, [post.slug]);

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
      <div
        className={`mt-4 px-1 ${
          props.detailPage
            ? ""
            : "max-h-[75svh] overflow-hidden overflow-y-auto"
        }`}
      >
        <div className="flex sticky top-0 z-[1] card shadow border-y px-2 dark:border-gray-500/70 py-1 items-center justify-between">
          <h4 className="sm:font-semibold text-sm dark:opacity-90">
            Comments {count}
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
      </div>
    </>
  );
}
