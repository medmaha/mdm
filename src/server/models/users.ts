import { generateUniqueSlug } from "@/lib/utils";
import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  serial,
  text,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { followers } from "./followers";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 256 }).unique().notNull(),
  username: varchar("username", { length: 256 }).unique().notNull(),
  password: varchar("password", { length: 256 }).notNull().default(""),
  avatar: varchar("avatar_url", { length: 256 }),
  biography: text("biography"),
  userType: varchar("user_type", {
    length: 256,
    enum: ["user", "viber", "admin"],
  }),
  postsCount: integer("posts_count").notNull().default(0),
  followersCount: integer("followers_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
  interactionCount: integer("interaction_count").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
  slug: varchar("slug", { length: 256 })
    .unique()
    .$defaultFn(generateUniqueSlug),
});

export const usersRelations = relations(users, ({ many }) => ({
  followers: many(followers),
}));

export type UserInterface = typeof users.$inferSelect;
