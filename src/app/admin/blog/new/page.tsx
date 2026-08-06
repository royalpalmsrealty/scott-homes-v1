import Link from "next/link";
import { NewPostForm } from "./NewPostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <Link href="/admin/blog" className="font-sans text-sm text-teal-deep hover:underline">
        &larr; All Posts
      </Link>
      <h1 className="mt-3 font-display text-3xl text-ink">New Post</h1>
      <p className="mt-2 max-w-xl font-sans text-sm text-body">
        Type a topic, or ask for 10 ideas first. The draft lands in the normal editor —
        nothing publishes until you explicitly say so.
      </p>
      <div className="mt-8 max-w-2xl border border-line bg-white p-6 sm:p-8">
        <NewPostForm />
      </div>
    </div>
  );
}
