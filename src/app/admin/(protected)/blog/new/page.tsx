import Link from "next/link";
import { NewPostForm } from "./NewPostForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function NewBlogPostPage() {
  return (
    <div>
      <Link href="/admin/blog" className="inline-flex items-center gap-1.5 font-sans text-sm text-teal-deep hover:underline">
        <BackIcon /> All Posts
      </Link>

      <div className="mt-4">
        <AdminPageHeader
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          }
          eyebrow="AI Writer"
          title="New Post"
          description="Type a topic, or ask for 10 ideas first. The draft lands in the normal editor — nothing publishes until you explicitly say so."
        />
      </div>

      <div className="mt-8 max-w-2xl rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <NewPostForm />
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
