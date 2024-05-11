import { sql } from "drizzle-orm";
import DB from "../db/connection";
import { likes } from "../models/likes";
import { posts } from "../models/posts";
import { users } from "../models/users";
import { comments, replies } from "../models/comments";

type LikeProps = {
  postSlug?: string;
  objectId?: string;
  username: string;
  objectType: "posts" | "comments" | "replies";
};

function getModel(type: LikeProps["objectType"]) {
  switch (type) {
    case "posts":
      return posts;
    case "comments":
      return comments;
    case "replies":
      return replies;
    default:
      return null;
  }
}

function getObject(props: LikeProps) {
  switch (props.objectType) {
    case "posts":
      return DB.query.posts.findFirst({
        where: sql`slug=${props.postSlug}`,
        columns: { id: true },
      });

    case "comments":
      return DB.query.comments.findFirst({
        where: sql`id=${props.objectId}`,
        columns: { id: true },
      });
    case "replies":
      return DB.query.replies.findFirst({
        where: sql`id=${props.objectId}`,
        columns: { id: true },
      });

    default:
      return null;
  }
}

export async function makeLikeObject(props: LikeProps) {
  try {
    const [object, author] = await Promise.all([
      getObject(props),
      DB.query.users.findFirst({
        where: sql`username=${props.username}`,
        columns: { id: true },
      }),
    ]);

    if (!object || !author) return null;

    const model = getModel(props.objectType);
    if (!model) return null;

    const likedBefore = await DB.query.likes.findFirst({
      // prettier-ignore
      where: sql`object_id=${object.id} AND author_id=${author.id} AND object_type=${props.objectType}`,
      columns: { id: true },
    });

    if (likedBefore) {
      await Promise.all([
        DB.delete(likes).where(sql`id=${likedBefore.id}`),
        DB.update(model)
          .set({ likesCount: sql`likes_count - 1` })
          .where(sql`id=${object.id}`),
        DB.update(users)
          .set({ interactionCount: sql`interaction_count - 1` })
          .where(sql`id=${author.id}`),
      ]);
      return { liked: false };
    }

    await Promise.all([
      DB.insert(likes).values({
        authorId: author.id,
        objectID: object.id,
        objectType: props.objectType,
      }),
      DB.update(model)
        .set({ likesCount: sql`likes_count + 1` })
        .where(sql`id=${object.id}`),
      DB.update(users)
        .set({ interactionCount: sql`interaction_count + 1` })
        .where(sql`id=${author.id}`),
    ]);

    return { liked: true };
  } catch (error) {
    return null;
  }
}
