import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Web search fallback tool.
 * When the knowledge base doesn't have answers, this tool searches the web
 * for publicly available information about Wade Foster and Zapier.
 *
 * It uses Tavily Search API for robust and accurate results, but defaults
 * back to basic scraping (DuckDuckGo) if the API key is missing.
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
  execute: async (args: any) => {
    // In some Mastra versions, input is inside context, in others it is top-level.
    const query = args?.query || args?.context?.query || args?.inputData?.query || "fallback query";
    
    console.log(`\n[web-search] 🌐 Launching external web search for: "${query}"`);
    const startTime = Date.now();

    try {
      const tavilyKey = process.env.TAVILY_API_KEY;

      if (tavilyKey) {
        console.log(`[web-search] 📡 Using robust Tavily Search API`);
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: tavilyKey,
            query,
            search_depth: "basic",
            max_results: 5,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const results = data.results.map((r: any) => ({
            title: r.title,
            url: r.url,
            snippet: r.content,
          }));

          const duration = Date.now() - startTime;
          console.log(`[web-search] ✅ Found ${results.length} external results via Tavily in ${duration}ms`);
          
          return {
            results,
            source: "web" as const,
            message: `Found ${results.length} web results via Tavily. Note: These are from external web search, not the curated knowledge base.`,
          };
        } else {
            console.warn(`[web-search] ⚠️ Tavily Search API failed: ${response.statusText}. Falling back to DuckDuckGo parsing.`);
        }
      } else {
          console.log(`[web-search] ⚠️ No TAVILY_API_KEY found. Using DuckDuckGo fallback parser.`);
      }

      // Fallback: DuckDuckGo HTML search
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
          throw new Error("DuckDuckGo request failed");
      }

      const html = await response.text();
      const results = parseDuckDuckGoResults(html);

      const duration = Date.now() - startTime;
      console.log(`[web-search] ✅ Found ${results.slice(0, 5).length} external results via DuckDuckGo in ${duration}ms`);

      if (results.length === 0) {
        return {
          results: [],
          source: "web" as const,
          message:
            "No web results found for this query. This topic may not be covered in Wade Foster's public statements.",
        };
      }

      return {
        results: results.slice(0, 5),
        source: "web" as const,
        message: `Found ${results.slice(0, 5).length} web results. Note: These are from web search, not from the curated knowledge base.`,
      };
    } catch (error) {
      console.error(`[web-search] ❌ Web search totally failed:`, error);
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

  const resultBlocks = html.match(
    /<div class="links_main links_deep result__body">[\s\S]*?<\/div>\s*<\/div>/g
  );

  if (!resultBlocks) {
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
    const urlMatch = block.match(
      /href="([^"]*)"[^>]*class="result__a"/
    ) || block.match(/class="result__a"[^>]*href="([^"]*)"/);
    const titleMatch = block.match(
      /<a class="result__a"[^>]*>([\s\S]*?)<\/a>/
    );
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
  const uddgMatch = url.match(/uddg=([^&]*)/);
  if (uddgMatch) {
    return decodeURIComponent(uddgMatch[1]);
  }
  return url;
}
