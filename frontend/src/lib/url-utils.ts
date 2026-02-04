import { API_BASE_URL } from "./api-client";

/**
 * Transforms a URL to use the current hostname instead of localhost.
 * This handles legacy data stored with localhost URLs.
 * 
 * @param url - The URL to transform (can be relative, absolute, or localhost-based)
 * @returns The transformed URL that works from any machine on the network
 * 
 * @example
 * // Relative URL
 * transformUrl("/upload/files/image.jpg") 
 * // => "http://192.168.1.5:8000/upload/files/image.jpg"
 * 
 * // Localhost URL (legacy data)
 * transformUrl("http://localhost:8000/upload/files/image.jpg")
 * // => "http://192.168.1.5:8000/upload/files/image.jpg"
 * 
 * // Already correct URL
 * transformUrl("http://192.168.1.5:8000/upload/files/image.jpg")
 * // => "http://192.168.1.5:8000/upload/files/image.jpg" (unchanged)
 */
export function transformUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // If it's a relative URL, prepend API_BASE_URL
  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  // If it's an absolute URL with localhost or 127.0.0.1, replace with current hostname
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url)) {
    return url.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?/, `$1${window.location.hostname}:8000`);
  }

  // Otherwise return as-is (already a proper absolute URL)
  return url;
}
