import NotFound from "@/app/not-found";
import { getPostDetail } from "@/server/controllers/posts";
import React from "react";
import BackButton from "@/app/components/UI/BackButton";
import PostDetailsComments from "./components/PostDetailsComments";
import { getAuthenticatedUser } from "@/lib/auth";
import { PostAuthor } from "../components/PostCard";
import PostCaption from "../components/PostCaption";
import PostActions from "../components/PostActions";
import PostImage from "../components/PostImage";
import PostVideo from "../components/PostVideo";
import { format } from "date-fns";

export default async function Page(props: PageProps) {
  const { slug } = props.params;
  const user = getAuthenticatedUser() || undefined;
  const post = await getPostDetail(slug);

  if (!post) return <NotFound message={"Post not found"} />;

  return (
    <div className="max-w-[1050px] mx-auto mb-6">
      <div className="flex px-4 items-center justify-between mb-4 gap-2 card p-2 rounded-lg">
        <div className="">
          <BackButton text />
        </div>
        <div className="">
          <h4 className="font-semibold md:text-lg">Post Details</h4>
        </div>
      </div>
      <div className="md:grid gap-2 md:grid-cols-[1fr,auto] card rounded-lg min-h-[95svh]_ overflow-hidden md:min-h-max_">
        <div className="md:max-w-[800px] flex-1 block space-y-4 pb-4 md:min-w-[400px] lg:min-w-[700px]">
          <div className="rounded-br overflow-hidden">
            {post.fileType === "image" && (
              <PostImage post={post} width={925} height={500} />
            )}
            {post.fileType === "video" && (
              <PostVideo post={post} width={925} autoPlay detailPage />
            )}
          </div>

          <div className="w-max px-2 md:block hidden">
            <PostAuthor post={post} />
          </div>
        </div>
        <div className="md:border-l pt-2 md:min-w-[300px] lg:max-w-[350px] w-full h-full">
          <div className="border-b px-2 space-y-4 pb-4 sticky md:static">
            <PostAuthor post={post} />
            <div className="space-y-4">
              <PostCaption
                caption={post.caption}
                mediaName={post.mediaName}
                time={format(post.createdAt, "PPPp")}
                postType={post.fileType}
              />
              <PostActions user={user} post={post} size="sm" />
            </div>
            {/* Add more post details here */}
          </div>
          <div className="md:max-h-[80svh] pl-2 pr-1 overflow-hidden overflow-y-auto pb-4 w-full">
            <PostDetailsComments post={post} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
