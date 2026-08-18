import { isOpenAIConfigured } from "@/lib/ai/openai";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listKnowledgeBaseFiles } from "@/lib/ai/knowledgeBase";
import { KnowledgeBaseManager } from "@/components/admin/KnowledgeBaseManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminKnowledgeBasePage() {
  const configured = isOpenAIConfigured() && isSupabaseConfigured();
  const files = configured ? await listKnowledgeBaseFiles() : [];

  const readyCount = files.filter((f) => f.status === "ready").length;
  const processingCount = files.filter((f) => f.status === "processing").length;

  return (
    <div>
      <AdminPageHeader
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5V6a2.5 2.5 0 0 1 2.5-2.5H20v15H6.5A2.5 2.5 0 0 0 4 21" />
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          </svg>
        }
        eyebrow="Chatbot Training Data"
        title="Knowledge Base"
        description={
          <>
            Upload the documents you want the website chatbot to answer from — FAQs, policies,
            property info, anything else. Visitors never see this page or these files directly;
            the chatbot just searches them when it&rsquo;s answering a question.
          </>
        }
      />

      {files.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 font-sans text-xs font-medium text-ink">
            {files.length} Total
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-3.5 py-1.5 font-sans text-xs font-medium text-teal-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
            {readyCount} Ready
          </span>
          {processingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 font-sans text-xs font-medium text-gold-deep">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden="true" />
              {processingCount} Processing
            </span>
          )}
        </div>
      )}

      <div className="mt-8">
        <KnowledgeBaseManager initialFiles={files} configured={configured} />
      </div>
    </div>
  );
}
