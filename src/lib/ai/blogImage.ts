import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { isOpenAIConfigured } from "./openai";

const IMAGES_API_URL = "https://api.openai.com/v1/images/generations";
const BUCKET = "blog-images";

let bucketEnsured = false;

async function ensureBucket() {
  if (bucketEnsured) return;
  const supabase = getSupabase();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }
  bucketEnsured = true;
}

// Deliberately generic/atmospheric rather than photorealistic-specific — this
// is never meant to pass as a photo of an actual listing, just a fitting
// editorial mood image for the post's theme.
function buildImagePrompt(title: string, category: string, imageKeywords: string[]): string {
  const subject = imageKeywords.length > 0 ? imageKeywords.join(", ") : title;
  return `Editorial real-estate blog cover photo, warm natural light, Key West Florida coastal aesthetic. Theme: ${subject}. Category: ${category}. Atmospheric and inviting, not a photo of any specific real property — no text, no watermarks, no logos, no people's faces in close-up.`;
}

// Generates one cover image for a freshly-drafted post and stores it in
// Supabase Storage (permanent, public URL) rather than trusting OpenAI's own
// image URLs, which expire. Never throws — a failed image generation should
// never block the draft itself from being created.
export async function generateAndStoreCoverImage(params: {
  slug: string;
  title: string;
  category: string;
  imageKeywords: string[];
}): Promise<{ url: string; alt: string } | null> {
  if (!isOpenAIConfigured() || !isSupabaseConfigured()) return null;

  try {
    const prompt = buildImagePrompt(params.title, params.category, params.imageKeywords);

    const res = await fetch(IMAGES_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1536x1024",
        quality: "medium",
        n: 1,
      }),
    });
    if (!res.ok) {
      console.error(`[blog-image] generation failed (${res.status}): ${await res.text().catch(() => "")}`);
      return null;
    }
    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return null;

    await ensureBucket();
    const bytes = Buffer.from(b64, "base64");
    const path = `${params.slug}-${Date.now()}.png`;

    const supabase = getSupabase();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "image/png" });
    if (uploadError) {
      console.error("[blog-image] upload failed:", uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const alt =
      params.imageKeywords.length > 0
        ? `Illustration representing ${params.imageKeywords.join(", ")}`
        : params.title;

    return { url: publicUrlData.publicUrl, alt };
  } catch (error) {
    console.error("[blog-image] unexpected failure:", error);
    return null;
  }
}

// Manual replacement upload — same bucket as the AI-generated covers, so
// both kinds of image are managed identically (public URL, same cleanup path).
export async function uploadCoverImageFile(file: File, slug: string): Promise<string> {
  await ensureBucket();
  const supabase = getSupabase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${slug}-${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: file.type });
  if (error) throw new Error(`Failed to upload cover image: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Best-effort cleanup when a cover image is replaced — only ever touches
// files inside our own bucket, so an old externally-hosted URL (or none) is
// silently left alone rather than treated as an error.
export async function deleteCoverImageIfOwned(url: string | undefined): Promise<void> {
  if (!url || !isSupabaseConfigured()) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await getSupabase().storage.from(BUCKET).remove([path]).catch(() => {});
}
