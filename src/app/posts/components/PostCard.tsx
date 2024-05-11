import { format } from "date-fns";

import PostImage from "./PostImage";
import PostCaption from "./PostCaption";
import PostActions from "./PostActions";
import Image from "next/image";
import PostVideo from "./PostVideo";
import { PostFeedsInterface } from "@/server/controllers/posts";
import { User2 } from "lucide-react";
import Link from "next/link";
import PostMusic from "./posts/PostMusic";

type Props = {
  user?: AuthUser;
  post: PostFeedsInterface;
};

// Post Card for individual posts
export default function Post({ post, user }: Props) {
  const time = format(post.createdAt, "MMM d 'at' h:mm a");

  return (
    <div className="grid lg:mb-4 grid-cols-1 shadow-md rounded-md overflow-hidden card max-w-[500px]">
      {/* <div className="grid items-center gap-2 justify-center">
      </div> */}
      {post.fileType === "image" && <PostImage post={post} />}
      {post.fileType === "video" && <PostVideo post={post} />}
      {post.fileType === "audio" && <PostMusic post={post} />}
      {post.fileType === "other" && <p>Unknown file type!</p>}
      <div className="space-y-4">
        <PostCaption
          time={time}
          postType={post.fileType}
          caption={post.caption}
          mediaName={post.mediaName}
        />
        <div className="flex p-2 pb-0 items-center justify-between gap-3">
          {post.fileType !== "audio" && (
            <>
              <PostAuthor post={post} />
              <p className="text-sm opacity-70">
                <small>
                  <time>{time}</time>
                  {/* <time>
                {formatDistance(new Date(post.created_at), new Date(), {
                  addSuffix: true,
                })}s
              </time> */}
                </small>
              </p>
            </>
          )}
        </div>

        <PostActions post={post} user={user} />
      </div>
    </div>
  );
}

type Props2 = {
  post: PostFeedsInterface;
};

export function PostAuthor({ post }: Props2) {
  return (
    <Link href={`/${post.author?.username}`} className="flex gap-2">
      <div className="w-11 h-11 border border-gray-400 rounded-full overflow-hidden">
        {post.author?.avatar && (
          <Image
            width={44} // Set width and height to maintain aspect ratio
            height={44}
            src={post.author.avatar}
            alt="avatar"
            className="w-full h-full rounded-full post-author-img"
          />
        )}
        {!post.author?.avatar && (
          <div className="h-full w-full dark:bg-black/30 flex items-center justify-center">
            <User2 width={28} height={28} />
          </div>
        )}
      </div>
      <div className="flex items-center_">
        <div className="">
          <p className="">{post.author?.name}</p>
          <p className="leading-none text-sm opacity-60">
            @{post.author?.username}
          </p>
        </div>
      </div>
    </Link>
  );
}
