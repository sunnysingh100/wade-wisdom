/** Strip HTML tags from a string */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Clean DuckDuckGo redirect URLs */
export function cleanUrl(url: string): string {
  const uddgMatch = url.match(/uddg=([^&]*)/);
  if (uddgMatch) {
    return decodeURIComponent(uddgMatch[1]);
  }
  return url;
}
