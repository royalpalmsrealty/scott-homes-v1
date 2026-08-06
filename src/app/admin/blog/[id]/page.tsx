import { notFound } from "next/navigation";
import { getPostById } from "@/lib/blog/store";
import { PostEditor } from "./PostEditor";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return <PostEditor post={post} />;
}
