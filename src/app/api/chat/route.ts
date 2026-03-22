import { mastra } from "@/mastra";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  const agent = mastra.getAgent("wade-wisdom-agent");

  const result = await agent.stream(lastMessage.content);

  // Track which tools were called so the frontend knows the source
  let usedWebSearch = false;

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.fullStream) {
          if (chunk.type === "tool-call") {
            if (chunk.payload.toolName === "wade-web-search") {
              usedWebSearch = true;
              // Send a source indicator the frontend can parse
              controller.enqueue(encoder.encode("\n[SOURCE:web]\n"));
            }
          }
          if ((chunk.type as string) === "reasoning") {
            controller.enqueue(encoder.encode(`\n<think>\n${(chunk as any).payload.text}\n</think>\n`));
          }
          if (chunk.type === "text-delta") {
            controller.enqueue(encoder.encode(chunk.payload.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
