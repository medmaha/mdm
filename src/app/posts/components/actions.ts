"use server";

import { getAuthenticatedUser } from "@/lib/auth";
import { uploadFile } from "@/lib/firebase/uploader";
import {
  CommentListInterface,
  createComment,
  getPostComments,
} from "@/server/controllers/comments";
import { makeLikeObject } from "@/server/controllers/likes";
import DB from "@/server/db/connection";
import {
  CommentInterface,
  comments,
  replies,
  ReplyInterface,
} from "@/server/models/comments";
import { posts } from "@/server/models/posts";
import { sql } from "drizzle-orm";

type MakeLikeProps = {
  slug?: string;
  objectId?: string;
  objectType: "posts" | "comments" | "replies";
};
// prettier-ignore
export async function makeLike(props:MakeLikeProps) :Promise<ActionReturn<boolean>>{
  const author = getAuthenticatedUser()

  if (!author){
    return {
      success:false,
      message:"You're unauthorized for this request"
    }
  }

  const response = await makeLikeObject({
    postSlug: props.slug,
    objectId:props.objectId,
    username:author.username,
    objectType:props.objectType
  })

  if (!response){
    return {
      success:false,
      message:`Error! failed to like ${props.objectType}`
    }
  }

  return {
    success:true,
    data: response.liked,
    message:`Liked ${response.liked ? '👍' : '👎'}`
  }
}

// prettier-ignore
export async function getComments<T>(slug: string) :Promise<ActionReturn<T>>{
    const comments = await getPostComments(slug)
    return {
        success:true,
        data: comments as T,
        message:"Comments retrieved successfully",
    }
}

// prettier-ignore
export async function makeComment(formData: FormData): Promise<ActionReturn<CommentInterface>> {
  // Make the user is authenticated
  const auth = getAuthenticatedUser();
  if (!auth) {
    return {
      success: false,
      message: "[Unauthorized] Invalid user",
    };
  }

  const json = Object.fromEntries(formData.entries());

  const { post_slug, comment_type, text } = json;

  return createComment<CommentInterface>(
    {
      author: auth.username,
      postSlug: post_slug?.toString(),
      commentType: comment_type.toString(),
      text: text?.toString(),
      file:(json.file as File),
    },
    false
  );
}

// prettier-ignore
export async function makeCommentReply(formData: FormData): Promise<ActionReturn<ReplyInterface>> {
  // Make the user is authenticated
  const auth = getAuthenticatedUser();
  if (!auth) {
    return {
      success: false,
      message: "[Unauthorized] Invalid user",
    };
  }
  const json = Object.fromEntries(formData.entries());
  const { post_slug, comment_type, text, parent_id } = json;

  return createComment<ReplyInterface>(
    {
      
      author: auth.username,
      postSlug: post_slug?.toString(),
      commentType: comment_type?.toString(),
      parentId: parent_id?.toString() as any,
      text: text?.toString(),
      file:(json.file as File),
    },
    true
  );
}
