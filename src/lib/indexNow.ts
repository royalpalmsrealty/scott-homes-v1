// IndexNow lets a site push "this URL changed" directly to search engines
// instead of waiting for a crawl. Needs INDEXNOW_KEY (a random string you
// generate and also host at /{key}.txt) plus a real production domain —
// neither exists yet, so this logs the intent instead of silently no-oping.
export async function pingIndexNow(url: string) {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.log(`[indexnow] Not configured — would have pinged: ${url}`);
    return;
  }

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, key }),
    });
  } catch (error) {
    console.error("IndexNow ping failed", error);
  }
}
