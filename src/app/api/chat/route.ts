import { mastra } from "@/mastra";

/**
 * Streaming signal constants.
 *
 * These use a unique, non-natural prefix (⟦__WW:) that the LLM will never
 * output accidentally, eliminating the false-positive risk of plaintext
 * markers like "[SOURCE:web]".
 */
const SIGNAL_PREFIX = "⟦__WW:";
const SIGNAL_SUFFIX = "⟧";
const SOURCE_WEB_SIGNAL = `${SIGNAL_PREFIX}SOURCE:web${SIGNAL_SUFFIX}`;
const SOURCE_KB_SIGNAL = `${SIGNAL_PREFIX}SOURCE:kb${SIGNAL_SUFFIX}`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  const agent = mastra.getAgent("wade-wisdom-agent");

  const result = await agent.stream(lastMessage.content);

  // Track which tools were called so the frontend knows the source
  let usedWebSearch = false;
  let usedKbSearch = false;

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let isReasoning = false;
      try {
        for await (const chunk of result.fullStream) {
          if (chunk.type === "tool-call") {
            if (chunk.payload.toolName === "wade-web-search") {
              usedWebSearch = true;
              controller.enqueue(encoder.encode(SOURCE_WEB_SIGNAL));
            } else if (chunk.payload.toolName === "wade-kb-search") {
              usedKbSearch = true;
              controller.enqueue(encoder.encode(SOURCE_KB_SIGNAL));
            }
          }
          if ((chunk.type as string) === "reasoning") {
            if (!isReasoning) {
              isReasoning = true;
              controller.enqueue(encoder.encode(`\n<think>\n`));
            }
            controller.enqueue(encoder.encode((chunk as any).payload.text));
          } else if (isReasoning && chunk.type === "text-delta") {
            // Transition from reasoning to normal text
            isReasoning = false;
            controller.enqueue(encoder.encode(`\n</think>\n`));
            controller.enqueue(encoder.encode(chunk.payload.text));
          } else if (chunk.type === "text-delta") {
            controller.enqueue(encoder.encode(chunk.payload.text));
          }
        }

        if (isReasoning) {
          controller.enqueue(encoder.encode(`\n</think>\n`));
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
