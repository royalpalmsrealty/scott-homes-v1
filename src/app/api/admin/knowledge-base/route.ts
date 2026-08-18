import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { isOpenAIConfigured } from "@/lib/ai/openai";
import { isSupabaseConfigured } from "@/lib/supabase";
import { listKnowledgeBaseFiles, uploadKnowledgeBaseFile, isFileTypeAllowed } from "@/lib/ai/knowledgeBase";

// Vercel serverless functions cap request body size well below this on
// lower-tier plans (historically ~4.5MB on Hobby) — flagging here since a
// scanned property brochure could exceed that regardless of this app-level
// limit. Raise this only alongside confirming the actual hosting plan's cap.
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function isReady() {
  // Both are needed: OpenAI stores/searches the actual documents, Supabase
  // tracks what's been uploaded so the admin page can list/delete them.
  return isOpenAIConfigured() && isSupabaseConfigured();
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isReady()) {
    return NextResponse.json({ files: [], configured: false });
  }
  const files = await listKnowledgeBaseFiles();
  return NextResponse.json({ files, configured: true });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isReady()) {
    return NextResponse.json({ error: "OpenAI and/or Supabase aren't configured yet." }, { status: 503 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!isFileTypeAllowed(file.name)) {
    return NextResponse.json({ error: "Unsupported file type — use PDF, Word, or text files." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large (10MB max)." }, { status: 400 });
  }

  try {
    const record = await uploadKnowledgeBaseFile(file);
    return NextResponse.json({ file: record });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }
}
