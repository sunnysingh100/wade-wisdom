import { Mastra } from "@mastra/core";
import { LibSQLVector } from "@mastra/libsql";
import { wadeAgent } from "./agents/wade-agent";

const libsqlVector = new LibSQLVector({
  id: "wade-wisdom-vectors",
  url: "file:///C:/Users/JULI/wade-wisdom/wade-wisdom.db",
});

export const mastra = new Mastra({
  agents: { "wade-wisdom-agent": wadeAgent },
  vectors: { libsqlVector },
});
