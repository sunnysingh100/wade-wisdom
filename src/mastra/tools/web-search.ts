import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Web search fallback tool.
 * When the knowledge base doesn't have answers, this tool searches the web
 * for publicly available information about Wade Foster and Zapier.
 *
 * Uses DuckDuckGo's instant-answer / HTML endpoint (no API key needed).
 */
export const webSearchTool = createTool({
  id: "wade-web-search",
  description:
    'Search the web for publicly available information about Wade Foster, Zapier, or related topics. Use this tool ONLY when the wade-kb-search tool returns no relevant results or when the user asks about something not covered in the knowledge base. Always prefix the query with "Wade Foster" or "Zapier" to keep results focused.',
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .max(200)
      .describe(
        "The search query. Should be specific and include 'Wade Foster' or 'Zapier' when relevant."
      ),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      })
    ),
    source: z.literal("web"),
    message: z.string(),
  }),
  execute: async ({ query }) => {
    try {
      // Use DuckDuckGo HTML search (no API key needed)
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        return {
          results: [],
          source: "web" as const,
          message:
            "Web search failed. I can still share general knowledge about this topic.",
        };
      }

      const html = await response.text();

      // Parse DuckDuckGo HTML results
      const results = parseDuckDuckGoResults(html);

      if (results.length === 0) {
        return {
          results: [],
          source: "web" as const,
          message:
            "No web results found for this query. This topic may not be covered in Wade Foster's public statements.",
        };
      }

      return {
        results: results.slice(0, 5), // Top 5 results
        source: "web" as const,
        message: `Found ${results.length} web results. Note: These are from web search, not from the curated knowledge base.`,
      };
    } catch {
      return {
        results: [],
        source: "web" as const,
        message:
          "Web search encountered an error. I'll answer based on general knowledge instead.",
      };
    }
  },
});

/**
 * Parse DuckDuckGo HTML search results into structured data
 */
function parseDuckDuckGoResults(
  html: string
): Array<{ title: string; url: string; snippet: string }> {
  const results: Array<{ title: string; url: string; snippet: string }> = [];

  // Match result blocks - DuckDuckGo wraps results in <div class="result...">
  const resultBlocks = html.match(
    /<div class="links_main links_deep result__body">[\s\S]*?<\/div>\s*<\/div>/g
  );

  if (!resultBlocks) {
    // Fallback: try to find result snippets with a simpler pattern
    const snippetPattern =
      /<a class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let match;

    while ((match = snippetPattern.exec(html)) !== null && results.length < 5) {
      const url = match[1];
      const title = stripHtml(match[2]);
      const snippet = stripHtml(match[3]);

      if (title && url && snippet) {
        results.push({
          title: title.trim(),
          url: cleanUrl(url),
          snippet: snippet.trim().slice(0, 300),
        });
      }
    }

    return results;
  }

  for (const block of resultBlocks.slice(0, 5)) {
    // Extract URL
    const urlMatch = block.match(
      /href="([^"]*)"[^>]*class="result__a"/
    ) || block.match(/class="result__a"[^>]*href="([^"]*)"/);
    // Extract title
    const titleMatch = block.match(
      /<a class="result__a"[^>]*>([\s\S]*?)<\/a>/
    );
    // Extract snippet
    const snippetMatch = block.match(
      /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/
    );

    if (urlMatch && titleMatch) {
      results.push({
        title: stripHtml(titleMatch[1]).trim(),
        url: cleanUrl(urlMatch[1]),
        snippet: snippetMatch
          ? stripHtml(snippetMatch[1]).trim().slice(0, 300)
          : "",
      });
    }
  }

  return results;
}

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
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
function cleanUrl(url: string): string {
  // DuckDuckGo wraps URLs in redirect links
  const uddgMatch = url.match(/uddg=([^&]*)/);
  if (uddgMatch) {
    return decodeURIComponent(uddgMatch[1]);
  }
  return url;
}
