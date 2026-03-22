import { createVectorQueryTool } from "@mastra/rag";
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";

export const kbSearchTool = createVectorQueryTool({
  id: "wade-kb-search",
  vectorStoreName: "libsqlVector",
  indexName: "wade_knowledge",
  model: new ModelRouterEmbeddingModel("mistral/mistral-embed"),
  description:
    "Search through Wade Foster's knowledge base to find information from his interviews, blog posts, and podcasts about startups, AI, automation, productivity, remote work, and Zapier growth. Use this tool when the user asks questions about these topics.",
});
