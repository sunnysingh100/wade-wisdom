import { createVectorQueryTool } from "@mastra/rag";
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";

const baseKbSearchTool = createVectorQueryTool({
  id: "wade-kb-search",
  vectorStoreName: "upstashVector",
  indexName: "wade_knowledge",
  model: new ModelRouterEmbeddingModel("mistral/mistral-embed"),
  description:
    "Search through Wade Foster's knowledge base to find information from his interviews, blog posts, and podcasts about startups, AI, automation, productivity, remote work, and Zapier growth. Use this tool when the user asks questions about these topics.",
});

export const kbSearchTool = new Proxy(baseKbSearchTool, {
  get: function(target, prop, receiver) {
    if (prop === "execute") {
      return async function(...args: unknown[]) {
        const params = args[0];
        const queryStr = extractQuery(params) || "unknown query";
        console.log(`\n[kb-search] 🕵️‍♂️ Engaging Knowledge Base for: "${queryStr}"`);
        const startTime = Date.now();
        
        try {
          const execute = target.execute as (...invokeArgs: unknown[]) => Promise<unknown>;
          const result = await execute(...args);
          const duration = Date.now() - startTime;
          
          let count = 0;
          if (Array.isArray(result)) count = result.length;
          else if (hasArrayProperty(result, "results")) count = result.results.length;
          else if (hasArrayProperty(result, "documents")) count = result.documents.length;
          else count = 1; // Unidentified shape, count as 1 block
          
          console.log(`[kb-search] ✅ Successfully retrieved ${count} internal document(s) in ${duration}ms`);
          return result;
        } catch (error) {
          console.error(`[kb-search] ❌ Search failed:`, error);
          throw error;
        }
      };
    }
    return Reflect.get(target, prop, receiver);
  }
});

function extractQuery(params: unknown): string | undefined {
  if (!params || typeof params !== "object") return undefined;
  const record = params as Record<string, unknown>;
  if (typeof record.query === "string" && record.query.trim()) return record.query;

  const context = record.context;
  if (context && typeof context === "object") {
    const query = (context as Record<string, unknown>).query;
    if (typeof query === "string" && query.trim()) return query;
  }

  const inputData = record.inputData;
  if (inputData && typeof inputData === "object") {
    const query = (inputData as Record<string, unknown>).query;
    if (typeof query === "string" && query.trim()) return query;
  }

  return undefined;
}

function hasArrayProperty<T extends string>(
  value: unknown,
  property: T
): value is Record<T, unknown[]> {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as Record<string, unknown>)[property])
  );
}
