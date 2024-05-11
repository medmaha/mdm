import DB from "../db/connection";
import { sql } from "drizzle-orm";
import { posts } from "../models/posts";
import { comments, replies } from "../models/comments";
import { uploadFile } from "@/lib/firebase/uploader";

interface CommentFormData {
  author: string;
  postSlug: string;
  commentType: any;
  parentId?: number;
  text?: string;
  file?: File | undefined;
}

/**
 * Function to create a comment or reply
 * @param formData Form data containing comment/reply information
 * @param isReply Boolean indicating if it's a reply or not
 * @param useComments Boolean indicating whether to update comments count in posts table
 * @returns Promise<ActionReturn<CommentInterface | ReplyInterface>> Result of the comment/reply creation
 */
// prettier-ignore
export async function createComment<T>(formData: CommentFormData, isReply: boolean): Promise<ActionReturn<T>> {
  // Find user
  const user = await DB.query.users.findFirst({ where: sql`username=${formData.author}` });
  if (!user) {
      return {
          success: false,
          message: "[Unauthorized] Invalid user",
      };
  }

  const { postSlug, commentType, parentId, text, file } = formData;

  // Validate comment/reply data
  if (!commentType || !postSlug || (isReply && !parentId)) {
      return {
          success: false,
          message: "Invalid comment",
      };
  }
  
  // Upload file if provided
  let fileUrl: string | undefined;
  if (file) {
      fileUrl = await uploadFile(file, "comment");
      if (!fileUrl)
          return {
              success: false,
              message: "Error uploading file",
          };
  }

  const commentData: any = {
      text,
      fileUrl,
      postSlug,
      commentType,
      authorId: user.id,
  };

  // Additional updates for replies or comments
  const additionalUpdates = isReply ? [
      DB.update(comments).set({ repliesCount: sql`replies_count + 1` }).where(sql`post_slug=${postSlug}`),
  ] : [];

  // Insert comment/reply and perform additional updates
  const [rows] = await Promise.all([
      isReply ? DB.insert(replies).values(commentData).returning() : DB.insert(comments).values(commentData).returning(),
      DB.update(posts).set({ commentsCount: sql`comments_count + 1` }).where(sql`slug=${postSlug}`),
      ...additionalUpdates.filter(Boolean)
  ]);

  return {
      success: true,
      data: rows[0] as T,
      message: "Comment created successfully",
  };
}

/**
 * Retrieves comments for a given post slug.
 * @param slug - The slug of the post to retrieve comments for.
 * @param limit - The maximum number of comments to retrieve (default: 15).
 * @param page - The page number of comments to retrieve (default: 1).
 * @returns An array of comments associated with the given post slug.
 */
export async function getPostComments(slug: string, limit = 15, page = 1) {
  // Retrieve comments from the database
  const data = await DB.query.comments.findMany({
    // Set the limit and offset for pagination
    limit,
    // Offset is calculated based on the page number
    offset: (page - 1) * limit,
    // Filter comments based on post slug
    where: sql`post_slug=${slug}`,
    // Only select the necessary fields
    columns: {
      authorId: false,
      createdAt: false,
    },
    // Include author and replies information
    with: {
      author: {
        // Only select the necessary fields
        columns: {
          name: true,
          avatar: true,
          username: true,
        },
      },
      replies: {
        // Only select the necessary fields
        columns: {
          authorId: false,
          createdAt: false,
        },
        // Include author information
        with: {
          author: {
            columns: {
              name: true,
              avatar: true,
              username: true,
            },
          },
        },
        limit,
        // Sort replies by updatedAt in ascending order
        orderBy(reply, { asc }) {
          return [asc(reply.updatedAt)];
        },
      },
    },
  });

  return data;
}

export type CommentListInterface = Awaited<
  Promise<ReturnType<typeof getPostComments>>
>;

export type CommentListReplyInterface = CommentListInterface[0]["replies"][0];
