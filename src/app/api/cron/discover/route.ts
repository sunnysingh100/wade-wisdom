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
 *
 * Monitoring: Every run is persisted to src/content/discovery-reports.json
 * so you can track performance over time without an external logging service.
 */

import { runDiscovery, DiscoveryReport } from "@/scripts/discover";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export const maxDuration = 60; // Allow up to 60s for the discovery process

/** Persistent log of all discovery runs for monitoring */
const REPORTS_LOG_PATH = path.join(
  process.cwd(),
  "src",
  "content",
  "discovery-reports.json"
);

const MAX_REPORTS = 100; // Keep last N reports to prevent unbounded growth

interface ReportsLog {
  reports: DiscoveryReport[];
}

function loadReportsLog(): ReportsLog {
  try {
    if (fs.existsSync(REPORTS_LOG_PATH)) {
      return JSON.parse(fs.readFileSync(REPORTS_LOG_PATH, "utf-8"));
    }
  } catch {
    // If corrupted, start fresh
  }
  return { reports: [] };
}

function appendReport(report: DiscoveryReport): void {
  const log = loadReportsLog();
  log.reports.push(report);
  // Trim to last N reports to prevent unbounded file growth
  if (log.reports.length > MAX_REPORTS) {
    log.reports = log.reports.slice(-MAX_REPORTS);
  }
  const tmpPath = REPORTS_LOG_PATH + ".tmp";
  fs.writeFileSync(tmpPath, JSON.stringify(log, null, 2), "utf-8");
  fs.renameSync(tmpPath, REPORTS_LOG_PATH);
}

export async function GET(req: Request) {
  // 1 — Validate the cron secret
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret") || "";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return Response.json(
      { error: "CRON_SECRET not configured on the server." },
      { status: 500 }
    );
  }

  // Use timingSafeEqual to prevent timing attacks
  const secretHash = crypto.createHash("sha256").update(secret).digest();
  const cronSecretHash = crypto.createHash("sha256").update(cronSecret).digest();

  if (!crypto.timingSafeEqual(secretHash, cronSecretHash)) {
    return Response.json(
      { error: "Unauthorized. Invalid or missing secret." },
      { status: 401 }
    );
  }

  // 2 — Run the discovery
  try {
    const report = await runDiscovery();

    // 3 — Persist the report for monitoring
    try {
      appendReport(report);
    } catch (logErr) {
      console.warn("Failed to persist discovery report:", logErr);
      // Non-fatal — the discovery itself succeeded
    }

    return Response.json({
      success: true,
      report,
    });
  } catch (err) {
    // Persist a failure report so we can track error rates too
    const failureReport: DiscoveryReport = {
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      queriesRun: 0,
      rawResultsFound: 0,
      newUrlsDiscovered: 0,
      documentsIngested: 0,
      chunksCreated: 0,
      duplicateContentSkipped: 0,
      errors: [err instanceof Error ? err.message : "Unknown fatal error"],
    };

    try {
      appendReport(failureReport);
    } catch { /* best effort */ }

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
