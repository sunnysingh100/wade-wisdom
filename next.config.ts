import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/core", "@mastra/rag", "@mastra/upstash", "@mastra/ai-sdk"],
};

export default nextConfig;
