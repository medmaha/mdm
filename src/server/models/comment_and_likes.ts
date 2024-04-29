import { users } from "./users";
import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  serial,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { posts } from "./posts";

// prettier-ignore
export const comments = pgTable("comments", {
    id: serial("id").primaryKey(),
    text: text("caption"),
    authorId: integer("author_id").notNull(),
    postSlug: varchar("post_slug").notNull(),
    fileUrl: varchar("file_url", { length: 256 }),
    hashtags: varchar("hashtags", { length: 256 }),
    likesCount: integer("likes_count").default(0),
    repliesCount: integer("replies_count").default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
    commentType: varchar("file_type", {length:20, enum: ["image", "audio", "text"] }),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  objectID: integer("object_id").notNull(),
  objectType: varchar("object_type", {
    length: 10,
    enum: ["posts", "comments"],
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postSlug],
    references: [posts.slug],
  }),
  likes: many(likes, {
    relationName: "comment_likes",
  }),
}));

export type LikeInterface = typeof likes.$inferSelect;
export type CommentInterface = typeof comments.$inferSelect;