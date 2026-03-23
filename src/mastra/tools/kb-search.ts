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

export const kbSearchTool = new Proxy(baseKbSearchTool as any, {
  get: function(target, prop, receiver) {
    if (prop === "execute") {
      return async function(...args: any[]) {
        const params = args[0] || {};
        const queryStr = params?.query || (params?.context && params?.context?.query) || (params?.inputData && params.inputData.query) || "unknown query";
        console.log(`\n[kb-search] 🕵️‍♂️ Engaging Knowledge Base for: "${queryStr}"`);
        const startTime = Date.now();
        
        try {
          // preserve 'this' context by using target
          const result = await target.execute.apply(target, args);
          const duration = Date.now() - startTime;
          
          let count = 0;
          if (Array.isArray(result)) count = result.length;
          else if (result && Array.isArray(result.results)) count = result.results.length;
          else if (result && Array.isArray(result.documents)) count = result.documents.length;
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
