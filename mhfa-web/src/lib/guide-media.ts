/**
 * Helper utility for Guide Media (YouTube & Interactive Web / Flipbook)
 */

/**
 * Automatically extracts the clean URL if user pastes an <iframe> tag,
 * or removes enclosing quotes and whitespace.
 */
export function extractEmbedUrl(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  // Check if input contains an <iframe> tag with src="..." or src='...'
  const iframeMatch = trimmed.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].trim();
  }

  // Check for unquoted src inside <iframe>
  const noQuoteMatch = trimmed.match(/<iframe\b[^>]*\bsrc=([^\s>]+)/i);
  if (noQuoteMatch && noQuoteMatch[1]) {
    return noQuoteMatch[1].replace(/["']/g, "").trim();
  }

  // Handle strings wrapped in quotes
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

/**
 * Extracts YouTube video ID (11 characters) from standard YouTube and youtu.be URLs.
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleaned = extractEmbedUrl(url);
  const match = cleaned.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  return match ? match[1] : null;
}

/**
 * Checks if the URL is a YouTube video URL.
 */
export function isYouTubeUrl(url: string): boolean {
  return Boolean(getYouTubeId(url));
}

/**
 * Checks if the URL is from the Heyzine Flipbook platform.
 */
export function isHeyzineUrl(url: string): boolean {
  if (!url) return false;
  const cleaned = extractEmbedUrl(url);
  return /heyzine\.com/i.test(cleaned);
}

/**
 * Extracts Heyzine Flipbook ID from the URL if available.
 * E.g., https://heyzine.com/flip-book/abc12345.html -> abc12345
 */
export function getHeyzineId(url: string): string | null {
  if (!url) return null;
  const cleaned = extractEmbedUrl(url);
  const match = cleaned.match(/heyzine\.com\/flip-book\/([a-zA-Z0-9_-]+)/i);
  if (match && match[1]) {
    return match[1].replace(/\.html$/i, "");
  }
  return null;
}

/**
 * Determines media type: "youtube" for YouTube videos, "embed" for Web / Flipbook modules.
 */
export function getGuideMediaType(url: string): "youtube" | "embed" {
  if (!url) return "youtube";
  return isYouTubeUrl(url) ? "youtube" : "embed";
}

/**
 * Returns a fallback cover thumbnail URL:
 * - If YouTube: standard hqdefault thumbnail
 * - If Web / Flipbook: an elegant high-resolution book & mental wellbeing cover image
 */
export function getGuideThumbnail(url: string): string {
  if (!url) {
    return "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600";
  }

  const ytId = getYouTubeId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  // Elegant fallback thumbnail for interactive e-book / flipbook modules
  return "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600";
}

/**
 * Asynchronously fetches genuine flipbook cover thumbnail from Heyzine oEmbed API.
 */
export async function fetchHeyzineThumbnail(url: string): Promise<string | null> {
  if (!isHeyzineUrl(url)) return null;
  const cleanUrl = extractEmbedUrl(url);
  try {
    const oembedEndpoint = `https://heyzine.com/api1/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
    const res = await fetch(oembedEndpoint);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.thumbnail_url === "string" && data.thumbnail_url) {
      return data.thumbnail_url;
    }
  } catch (err) {
    console.warn("Failed to fetch Heyzine oEmbed cover:", err);
  }
  return null;
}

