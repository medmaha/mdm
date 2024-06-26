import PostsWrapper from "@/app/posts/components";
import { getPostFeeds } from "@/server/controllers/posts";

export default async function Page(props: PageProps) {
  const searchParams = props.searchParams;
  console.log("SearchParams:", searchParams);
  const posts = await getPostFeeds();

  return (
    <div className="">
      <PostsWrapper posts={posts} />
    </div>
  );
}
