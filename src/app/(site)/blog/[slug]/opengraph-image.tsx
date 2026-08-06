import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog/store";
import { brand } from "@/lib/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const title = post?.title ?? brand.brokerage;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#000000",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#96802E",
            marginBottom: 16,
          }}
        >
          {brand.brokerage}
        </div>
        <div style={{ fontSize: 56, color: "#ffffff", lineHeight: 1.2, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ height: 3, width: 100, background: "#28BCB8", marginTop: 32 }} />
      </div>
    ),
    { ...size }
  );
}
