import { posts, postsRelations } from "./posts";
import { users } from "./users";
import { followers, followerRelations } from "./followers";
import { viber, viberRelations } from "./viber";
import { supporter, supporterRelations } from "./supporter";
import {
  comments,
  replies,
  repliesRelations,
  commentsRelations,
} from "./comments";
import { likes, likesRelations } from "./likes";

const relations = {
  viberRelations,
  postsRelations,
  commentsRelations,
  followerRelations,
  repliesRelations,
  likesRelations,
  supporterRelations,
};

const schema = {
  users,
  posts,
  comments,
  viber,
  supporter,
  likes,
  replies,
  followers,
  ...relations,
};

export default schema;
