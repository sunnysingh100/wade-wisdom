/**
 * Web Discovery Script
 *
 * Searches the web for new publicly available content about Wade Foster & Zapier,
 * extracts relevant text, deduplicates against already-ingested content,
 * and upserts new findings into the vector knowledge base.
 *
 * Can be invoked:
 *   - Manually: `npm run discover`
 *   - Via cron: GET /api/cron/discover?secret=<CRON_SECRET>
 */

import "dotenv/config";
import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { UpstashVector } from "@mastra/upstash";
import * as fs from "fs";
import * as path from "path";

// ─── Config ───────────────────────────────────────────────────────────

// Vector store credentials are read from env vars: UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN
const INDEX_NAME = "wade_knowledge";
const EMBEDDING_MODEL = "mistral-embed";
const EMBEDDING_DIMENSION = 1024;

/** File that tracks which URLs we've already processed */
const DISCOVERY_LOG_PATH = path.join(
  process.cwd(),
  "src",
  "content",
  "discovery-log.json"
);

/** Search queries to find new Wade Foster / Zapier content */
const SEARCH_QUERIES = [
  "Wade Foster Zapier interview 2025 2026",
  "Wade Foster CEO blog post recent",
  "Zapier AI automation latest news",
  "Wade Foster startup advice podcast",
  "Wade Foster remote work leadership",
  "Zapier company updates announcements",
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ─── Types ────────────────────────────────────────────────────────────

interface DiscoveryLog {
  lastRun: string | null;
  processedUrls: Record<string, { addedAt: string; title: string }>;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface DiscoveredDocument {
  title: string;
  url: string;
  content: string;
  snippet: string;
}

export interface DiscoveryReport {
  startedAt: string;
  completedAt: string;
  queriesRun: number;
  rawResultsFound: number;
  newUrlsDiscovered: number;
  documentsIngested: number;
  chunksCreated: number;
  errors: string[];
}

// ─── Discovery Log helpers ────────────────────────────────────────────

function loadDiscoveryLog(): DiscoveryLog {
  try {
    if (fs.existsSync(DISCOVERY_LOG_PATH)) {
      return JSON.parse(fs.readFileSync(DISCOVERY_LOG_PATH, "utf-8"));
    }
  } catch {
    // Corrupted file — start fresh
  }
  return { lastRun: null, processedUrls: {} };
}

function saveDiscoveryLog(log: DiscoveryLog): void {
  fs.writeFileSync(DISCOVERY_LOG_PATH, JSON.stringify(log, null, 2), "utf-8");
}

// ─── Web search (Serper.dev + DuckDuckGo fallback) ──────────────────
//
// Primary:  Serper.dev Google Search API (free tier = 2,500 queries/month)
//           Sign up at https://serper.dev — set SERPER_API_KEY in .env
// Fallback: DuckDuckGo lite / HTML (no API key, but may be blocked)

async function searchWeb(query: string): Promise<SearchResult[]> {
  // 1. Try Serper.dev (Google Search API) — most reliable
  const serperKey = process.env.SERPER_API_KEY;
  if (serperKey) {
    const results = await searchSerper(query, serperKey);
    if (results.length > 0) return results;
  }

  // 2. Fallback: DuckDuckGo lite
  let results = await searchDDGLite(query);
  if (results.length > 0) return results;

  // 3. Fallback: DuckDuckGo HTML
  results = await searchDDGHtml(query);
  return results;
}

/** Serper.dev — Google Search API (free tier: 2,500 queries/month) */
async function searchSerper(
  query: string,
  apiKey: string
): Promise<SearchResult[]> {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 8 }),
    });

    if (!response.ok) {
      console.log(`   ⚠️ Serper API returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    const organic = data.organic || [];

    return organic.map((r: any) => ({
      title: r.title || "",
      url: r.link || "",
      snippet: (r.snippet || "").slice(0, 500),
    }));
  } catch (err) {
    console.log(`   ⚠️ Serper search failed: ${err}`);
    return [];
  }
}

/** DuckDuckGo Lite — simpler HTML, less likely to be blocked */
async function searchDDGLite(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch("https://lite.duckduckgo.com/lite/", {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `q=${encodeURIComponent(query)}`,
    });

    if (!response.ok) return [];
    const html = await response.text();
    return parseDDGLiteResults(html);
  } catch {
    return [];
  }
}

/** DuckDuckGo HTML — standard endpoint */
async function searchDDGHtml(query: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) return [];
    const html = await response.text();
    return parseDDGHtmlResults(html);
  } catch {
    return [];
  }
}

/** Parse DuckDuckGo Lite results (table-based layout) */
function parseDDGLiteResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];

  // Lite uses a table-based layout. Links are in <a class="result-link"> or just <a> inside result rows
  // Each result row contains a link and a snippet td
  const rowPattern =
    /<a[^>]+href="([^"]*)"[^>]*class="result-link"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;
  let match;

  while ((match = rowPattern.exec(html)) !== null && results.length < 8) {
    const url = cleanUrl(match[1]);
    const title = stripHtml(match[2]);
    const snippet = stripHtml(match[3]);

    if (title && url && url.startsWith("http")) {
      results.push({
        title: title.trim(),
        url,
        snippet: (snippet || "").trim().slice(0, 500),
      });
    }
  }

  // Fallback: try a more generic pattern for lite
  if (results.length === 0) {
    const linkPattern = /<a[^>]+href="(https?:\/\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const seenUrls = new Set<string>();

    while (
      (match = linkPattern.exec(html)) !== null &&
      results.length < 8
    ) {
      const url = cleanUrl(match[1]);
      const title = stripHtml(match[2]);

      // Skip DuckDuckGo internal links
      if (
        url.includes("duckduckgo.com") ||
        url.includes("duck.co") ||
        !title ||
        title.length < 5 ||
        seenUrls.has(url)
      )
        continue;

      seenUrls.add(url);
      results.push({ title: title.trim(), url, snippet: "" });
    }
  }

  return results;
}

/** Parse DuckDuckGo HTML results */
function parseDDGHtmlResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];

  const snippetPattern =
    /<a class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let match;

  while ((match = snippetPattern.exec(html)) !== null && results.length < 8) {
    const url = cleanUrl(match[1]);
    const title = stripHtml(match[2]);
    const snippet = stripHtml(match[3]);

    if (title && url && url.startsWith("http")) {
      results.push({
        title: title.trim(),
        url,
        snippet: (snippet || "").trim().slice(0, 500),
      });
    }
  }

  return results;
}

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

function cleanUrl(url: string): string {
  const uddgMatch = url.match(/uddg=([^&]*)/);
  if (uddgMatch) return decodeURIComponent(uddgMatch[1]);
  return url;
}

// ─── Content extraction ──────────────────────────────────────────────

async function extractPageContent(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return null;
    }

    const html = await response.text();

    // Extract meaningful text from HTML
    let text = html
      // Remove scripts, styles, nav, footer
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      // Strip remaining HTML tags
      .replace(/<[^>]*>/g, " ")
      // Clean up entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&nbsp;/g, " ")
      // Collapse whitespace
      .replace(/\s+/g, " ")
      .trim();

    // Only keep pages with substantial content
    if (text.length < 200) return null;

    // Cap at ~5000 chars to keep embeddings focused
    if (text.length > 5000) {
      text = text.slice(0, 5000) + "…";
    }

    return text;
  } catch {
    return null;
  }
}

// ─── Relevance check ─────────────────────────────────────────────────

/**
 * Quick heuristic: does the page content mention Wade Foster or Zapier enough?
 */
function isRelevantContent(content: string): boolean {
  const lower = content.toLowerCase();
  const wadeCount =
    (lower.match(/wade foster/g) || []).length +
    (lower.match(/wade/g) || []).length * 0.3;
  const zapierCount = (lower.match(/zapier/g) || []).length;

  // Must mention Wade or Zapier at least a few times
  return wadeCount >= 2 || zapierCount >= 3 || (wadeCount >= 1 && zapierCount >= 1);
}

// ─── Main discovery flow ─────────────────────────────────────────────

export async function runDiscovery(): Promise<DiscoveryReport> {
  const report: DiscoveryReport = {
    startedAt: new Date().toISOString(),
    completedAt: "",
    queriesRun: 0,
    rawResultsFound: 0,
    newUrlsDiscovered: 0,
    documentsIngested: 0,
    chunksCreated: 0,
    errors: [],
  };

  console.log("🔍 Starting web discovery for new Wade Foster / Zapier content...\n");

  // 1 — Load discovery log
  const log = loadDiscoveryLog();
  console.log(
    `📋 Discovery log: ${Object.keys(log.processedUrls).length} URLs already processed`
  );
  if (log.lastRun) {
    console.log(`   Last run: ${log.lastRun}\n`);
  }

  // 2 — Search the web
  const allResults: SearchResult[] = [];

  for (const query of SEARCH_QUERIES) {
    console.log(`🔎 Searching: "${query}"`);
    report.queriesRun++;

    try {
      const results = await searchWeb(query);
      console.log(`   Found ${results.length} results`);
      allResults.push(...results);

      // Be polite — small delay between searches
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      const msg = `Search failed for "${query}": ${err}`;
      console.error(`   ❌ ${msg}`);
      report.errors.push(msg);
    }
  }

  report.rawResultsFound = allResults.length;

  // 3 — Deduplicate by URL, skip already-processed
  const uniqueUrls = new Map<string, SearchResult>();
  for (const result of allResults) {
    const normalizedUrl = result.url.replace(/\/$/, "").toLowerCase();
    if (!log.processedUrls[normalizedUrl] && !uniqueUrls.has(normalizedUrl)) {
      uniqueUrls.set(normalizedUrl, result);
    }
  }

  console.log(
    `\n📊 ${allResults.length} total results → ${uniqueUrls.size} new unique URLs to process\n`
  );
  report.newUrlsDiscovered = uniqueUrls.size;

  if (uniqueUrls.size === 0) {
    console.log("✅ No new content found. Knowledge base is up to date!");
    report.completedAt = new Date().toISOString();
    log.lastRun = report.completedAt;
    saveDiscoveryLog(log);
    return report;
  }

  // 4 — Fetch & filter content
  const documents: DiscoveredDocument[] = [];

  for (const [url, result] of uniqueUrls) {
    console.log(`📥 Fetching: ${url}`);

    const content = await extractPageContent(result.url);
    if (!content) {
      console.log(`   ⚠️ Could not extract content, skipping`);
      // Mark as processed so we don't retry
      log.processedUrls[url] = {
        addedAt: new Date().toISOString(),
        title: `[SKIPPED] ${result.title}`,
      };
      continue;
    }

    if (!isRelevantContent(content)) {
      console.log(`   ⚠️ Content not relevant enough, skipping`);
      log.processedUrls[url] = {
        addedAt: new Date().toISOString(),
        title: `[IRRELEVANT] ${result.title}`,
      };
      continue;
    }

    console.log(`   ✅ Relevant content found (${content.length} chars)`);
    documents.push({
      title: result.title,
      url: result.url,
      content,
      snippet: result.snippet,
    });

    // Be polite — delay between fetches
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n📄 ${documents.length} relevant documents to ingest\n`);

  if (documents.length === 0) {
    console.log("✅ No new relevant content found.");
    report.completedAt = new Date().toISOString();
    log.lastRun = report.completedAt;
    saveDiscoveryLog(log);
    return report;
  }

  // 5 — Initialize vector store
  const upstashVector = new UpstashVector({
    id: "wade-wisdom-vectors",
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  });

  // Ensure index exists
  await upstashVector.createIndex({
    indexName: INDEX_NAME,
    dimension: EMBEDDING_DIMENSION,
  });

  // 6 — Chunk, embed, and upsert each document
  for (const doc of documents) {
    console.log(`\n📄 Ingesting: ${doc.title}`);

    try {
      // Format as markdown for better chunking
      const markdown = `# ${doc.title}\n\nSource: ${doc.url}\n\n${doc.content}`;

      const mDoc = MDocument.fromMarkdown(markdown, {
        topic: "web-discovery",
        sourceType: "web",
        title: doc.title,
        url: doc.url,
        discoveredAt: new Date().toISOString(),
      });

      const chunks = await mDoc.chunk({
        strategy: "markdown",
        headers: [
          ["#", "title"],
          ["##", "section"],
        ],
      });

      const texts = chunks.map((chunk) =>
        typeof chunk === "string" ? chunk : chunk.text
      );

      if (texts.length === 0) {
        console.log(`   ⚠️ No chunks generated, skipping`);
        continue;
      }

      console.log(`   📝 Generated ${texts.length} chunks`);

      // Generate embeddings
      const { embeddings } = await embedMany({
        model: mistral.textEmbeddingModel(EMBEDDING_MODEL),
        values: texts,
      });

      console.log(`   🧮 Generated ${embeddings.length} embeddings`);

      // Upsert into vector store
      await upstashVector.upsert({
        indexName: INDEX_NAME,
        vectors: embeddings,
        metadata: texts.map((text, i) => ({
          text,
          topic: "web-discovery",
          sourceType: "web",
          title: doc.title,
          url: doc.url,
          chunkIndex: i,
          discoveredAt: new Date().toISOString(),
        })),
      });

      report.chunksCreated += texts.length;
      report.documentsIngested++;
      console.log(`   ✅ Upserted ${texts.length} vectors`);

      // Mark URL as processed
      const normalizedUrl = doc.url.replace(/\/$/, "").toLowerCase();
      log.processedUrls[normalizedUrl] = {
        addedAt: new Date().toISOString(),
        title: doc.title,
      };
    } catch (err) {
      const msg = `Failed to ingest "${doc.title}": ${err}`;
      console.error(`   ❌ ${msg}`);
      report.errors.push(msg);
    }
  }

  // 7 — Save updated log
  report.completedAt = new Date().toISOString();
  log.lastRun = report.completedAt;
  saveDiscoveryLog(log);

  // 8 — Summary
  console.log("\n" + "═".repeat(50));
  console.log("🎉 Discovery complete!");
  console.log(`   Queries run:        ${report.queriesRun}`);
  console.log(`   Raw results:        ${report.rawResultsFound}`);
  console.log(`   New URLs found:     ${report.newUrlsDiscovered}`);
  console.log(`   Documents ingested: ${report.documentsIngested}`);
  console.log(`   Chunks created:     ${report.chunksCreated}`);
  if (report.errors.length > 0) {
    console.log(`   ⚠️ Errors:          ${report.errors.length}`);
  }
  console.log("═".repeat(50));

  return report;
}

// ─── CLI entry point ─────────────────────────────────────────────────

// Allow running directly with: npx tsx src/scripts/discover.ts
if (process.argv[1]?.includes("discover")) {
  runDiscovery()
    .then((report) => {
      if (report.errors.length > 0) {
        console.log("\n⚠️ Errors encountered:");
        report.errors.forEach((e) => console.log(`  - ${e}`));
      }
    })
    .catch(console.error);
}
