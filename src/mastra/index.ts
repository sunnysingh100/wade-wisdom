import { Mastra } from "@mastra/core";
import { UpstashVector } from "@mastra/upstash";
import { wadeAgent } from "./agents/wade-agent";

const upstashVector = new UpstashVector({
  id: "wade-wisdom-vectors",
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export const mastra = new Mastra({
  agents: { "wade-wisdom-agent": wadeAgent },
  vectors: { upstashVector },
});
