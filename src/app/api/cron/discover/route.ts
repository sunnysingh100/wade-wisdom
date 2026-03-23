/**
 * Cron endpoint for periodic web discovery.
 *
 * Trigger:  GET /api/cron/discover?secret=<CRON_SECRET>
 *
 * This endpoint searches the web for new Wade Foster / Zapier content
 * and upserts it into the vector knowledge base. Designed to be called
 * by an external scheduler (cron-job.org, Vercel Cron, etc.) every ~72 hours.
 *
 * Security: Requires a `secret` query parameter matching the CRON_SECRET env var.
 */

import { runDiscovery } from "@/scripts/discover";

export const maxDuration = 60; // Allow up to 60s for the discovery process

export async function GET(req: Request) {
  // 1 — Validate the cron secret
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return Response.json(
      { error: "CRON_SECRET not configured on the server." },
      { status: 500 }
    );
  }

  if (secret !== cronSecret) {
    return Response.json(
      { error: "Unauthorized. Invalid or missing secret." },
      { status: 401 }
    );
  }

  // 2 — Run the discovery
  try {
    const report = await runDiscovery();

    return Response.json({
      success: true,
      report,
    });
  } catch (err) {
    console.error("Discovery cron failed:", err);
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
