import type { PostRow } from "@/types/content";

export type HomePost = Pick<PostRow, "id" | "slug" | "title" | "description" | "created_at"> & {
  image_url: string | null;
};
