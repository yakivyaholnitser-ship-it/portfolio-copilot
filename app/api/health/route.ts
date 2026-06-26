import { ok } from "@/lib/api/http";
import { appConfig } from "@/lib/config/app";
import type { HealthResponse } from "@/types/health";

export const dynamic = "force-dynamic";

export function GET() {
  const response: HealthResponse = {
    service: appConfig.name,
    status: "ok",
    version: appConfig.version,
    timestamp: new Date().toISOString(),
  };

  return ok(response);
}
