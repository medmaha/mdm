import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  serial,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { users } from "./users";

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  objectID: integer("object_id").notNull(),
  objectType: varchar("object_type", {
    length: 10,
    enum: ["posts", "comments", "replies"],
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.objectID],
    references: [posts.id],
    relationName: "post_likes",
  }),
  author: one(users, {
    fields: [likes.objectID],
    references: [users.id],
  }),
}));

export type LikeInterface = typeof likes.$inferSelect;
