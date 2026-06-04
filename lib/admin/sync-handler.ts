import { CatalogSync } from "@/lib/catalog-sync/catalog-sync";
import { createAdminClient } from "@/lib/supabase/admin";

export function createCatalogSync() {
  return new CatalogSync(createAdminClient());
}

export function jsonError(message: string, status = 500) {
  return Response.json({ error: message }, { status });
}

export async function runSync<T>(
  fn: () => Promise<T>,
  meta?: Record<string, unknown>,
) {
  try {
    const data = await fn();
    return Response.json({ ok: true, data, ...meta });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[catalog-sync]", err);
    return jsonError(message, 500);
  }
}
