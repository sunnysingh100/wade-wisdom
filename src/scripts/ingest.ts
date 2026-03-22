import "dotenv/config";
import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { LibSQLVector } from "@mastra/libsql";
import { wadeKnowledge } from "../content/wade-knowledge";

async function ingest() {
  console.log("🚀 Starting Wade Wisdom knowledge ingestion...\n");

  const libsqlVector = new LibSQLVector({
    id: "wade-wisdom-vectors",
    url: "file:///C:/Users/JULI/wade-wisdom/wade-wisdom.db",
  });

  // Create the index if it doesn't exist
  console.log("📦 Creating vector index...");
  await libsqlVector.createIndex({
    indexName: "wade_knowledge",
    dimension: 1024, // Mistral embed dimension
  });

  let totalChunks = 0;

  for (const doc of wadeKnowledge) {
    console.log(`\n📄 Processing: ${doc.title}`);

    // Create MDocument from markdown content
    const mDoc = MDocument.fromMarkdown(doc.content, {
      topic: doc.topic,
      sourceType: doc.sourceType,
      title: doc.title,
    });

    // Chunk the document
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
      console.log(`  ⚠️ No chunks generated, skipping`);
      continue;
    }

    console.log(`  📝 Generated ${texts.length} chunks`);

    // Generate embeddings using Mistral directly (no Mastra router needed)
    const { embeddings } = await embedMany({
      model: mistral.textEmbeddingModel("mistral-embed"),
      values: texts,
    });

    console.log(`  🧮 Generated ${embeddings.length} embeddings`);

    // Upsert into vector store
    await libsqlVector.upsert({
      indexName: "wade_knowledge",
      vectors: embeddings,
      metadata: texts.map((text, i) => ({
        text,
        topic: doc.topic,
        sourceType: doc.sourceType,
        title: doc.title,
        chunkIndex: i,
      })),
    });

    totalChunks += texts.length;
    console.log(`  ✅ Upserted ${texts.length} vectors`);
  }

  console.log(`\n🎉 Ingestion complete!`);
  console.log(`   Total documents: ${wadeKnowledge.length}`);
  console.log(`   Total chunks: ${totalChunks}`);
}

ingest().catch(console.error);
