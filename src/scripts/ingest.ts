import "dotenv/config";
import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { UpstashVector } from "@mastra/upstash";
import { wadeKnowledge } from "../content/wade-knowledge";
import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const documentSchema = z.object({
  content: z.string(),
  topic: z.string(),
  sourceType: z.string(),
  title: z.string(),
});

const chunkSchema = z.object({
  text: z.string(),
  topic: z.string(),
  sourceType: z.string(),
  title: z.string(),
  chunkIndex: z.number(),
});

type IngestionDocument = z.infer<typeof documentSchema>;
type IngestionChunk = z.infer<typeof chunkSchema>;

const upstashVector = new UpstashVector({
  id: "wade-wisdom-vectors",
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const chunkingStep = createStep({
  id: "chunk-documents",
  description: "Chunks documents",
  inputSchema: z.object({
    documents: z.array(documentSchema),
  }),
  outputSchema: z.object({
    chunks: z.array(chunkSchema),
  }),
  execute: async ({ inputData }) => {
    console.log("🚀 Starting Document Chunking Pipeline...\n");
    const { documents } = inputData as { documents: IngestionDocument[] };
    const allChunks: IngestionChunk[] = [];

    for (const doc of documents) {
      console.log(`\n📄 Chunking Document: ${doc.title}`);

      const mDoc = MDocument.fromMarkdown(doc.content, {
        topic: doc.topic,
        sourceType: doc.sourceType,
        title: doc.title,
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

      console.log(`  📝 Generated ${texts.length} chunks`);

      texts.forEach((text, i) => {
        allChunks.push({
          text,
          topic: doc.topic,
          sourceType: doc.sourceType,
          title: doc.title,
          chunkIndex: i,
        });
      });
    }

    return { chunks: allChunks };
  },
});

const embeddingStep = createStep({
  id: "embed-and-upsert",
  description: "Generates embeddings and upserts to vectors",
  inputSchema: z.object({}), 
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async ({ getStepResult }) => {
    console.log("\n🧮 Starting Embedding & DB Upsert...\n");

    const previousStepResult = getStepResult("chunk-documents");
    
    // Safely extract chunks handling potential Mastra wrapper variations
    let payload: unknown = previousStepResult;
    if (isRecord(payload) && payload.status === "success" && isRecord(payload.result)) {
      payload = payload.result;
    } else if (isRecord(payload) && isRecord(payload.output)) {
      payload = payload.output;
    }
    
    const chunks = isRecord(payload) && Array.isArray(payload.chunks)
      ? payload.chunks.filter(isChunk)
      : [];

    if (chunks.length === 0) {
      console.log("  ⚠️ No chunks to process, skipping embedding.");
      return { success: true };
    }

    console.log(`  📚 Processing ${chunks.length} total chunks through Mistral API...`);

    console.log("📦 Creating/verifying Upstash vector index...");
    await upstashVector.createIndex({
      indexName: "wade_knowledge",
      dimension: 1024,
    });

    const texts = chunks.map((c) => c.text);

    // Call Mistral API for all texts
    const { embeddings } = await embedMany({
      model: mistral.textEmbeddingModel("mistral-embed"),
      values: texts,
    });

    console.log(`  🧮 Generated ${embeddings.length} embeddings successfully`);

    await upstashVector.upsert({
      indexName: "wade_knowledge",
      vectors: embeddings,
      metadata: chunks,
    });

    console.log(`  ✅ Upserted ${embeddings.length} vectors into Upstash`);
    return { success: true };
  },
});

const ingestionWorkflow = createWorkflow({
  id: "wade-ingestion",
  inputSchema: z.object({
    documents: z.array(documentSchema),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  })
})
  .then(chunkingStep)
  .then(embeddingStep)
  .commit();

async function runIngestion() {
  console.log("=========================================");
  console.log("🌟 Initiating Wade Wisdom System Ingestion");
  console.log("=========================================");
  try {
    const run = await ingestionWorkflow.createRun();
    const result = await run.start({
      inputData: {
        documents: wadeKnowledge,
      },
    });
    
    if (result.status === "success") {
        console.log(`\n🎉 Ingestion Pipeline completed successfully!`);
    } else {
        const resultDetails = isRecord(result)
          ? ("error" in result ? result.error : "tripwire" in result ? result.tripwire : undefined)
          : undefined;
        console.error(`\n❌ Ingestion Pipeline did not succeed. Status:`, result.status, resultDetails);
    }
  } catch (error) {
    console.error(`\n🔥 Fatal Ingestion Pipeline Error:`, error);
  }
}

runIngestion();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isChunk(value: unknown): value is IngestionChunk {
  const parsed = chunkSchema.safeParse(value);
  return parsed.success;
}
