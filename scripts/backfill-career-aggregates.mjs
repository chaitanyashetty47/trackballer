#!/usr/bin/env node
// Refresh player_career_aggregates.display_score from fm_base_rating for provisional rows.
// Run after seed-fm-ratings.mjs:
//   node --env-file=.env scripts/backfill-career-aggregates.mjs

import { createClient } from "@supabase/supabase-js";

const BATCH_SIZE = 100;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in env.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const isDryRun = process.argv.includes("--dry-run");

/** PostgREST caps at 1000 rows unless paginated. */
async function fetchAllProvisionalRows() {
  const pageSize = 1000;
  const all = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("player_career_aggregates")
      .select("player_id, vote_count, display_score, players!inner(fm_base_rating)")
      .eq("vote_count", 0)
      .order("player_id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

let rows;
try {
  rows = await fetchAllProvisionalRows();
} catch (fetchError) {
  console.error("Fetch failed:", fetchError.message);
  process.exit(1);
}

const updates = [];
for (const row of rows) {
  const fm = row.players?.fm_base_rating;
  const displayScore = fm != null ? Number(fm) : 50;
  if (Number(row.display_score) === displayScore) continue;
  updates.push({ player_id: row.player_id, display_score: displayScore });
}

console.log(`Candidates: ${rows.length}`);
console.log(`To update: ${updates.length}`);

if (isDryRun) {
  console.log("\nDRY RUN — first 5:");
  for (const u of updates.slice(0, 5)) console.log(`  ${JSON.stringify(u)}`);
  process.exit(0);
}

let ok = 0;
let failed = 0;

for (let i = 0; i < updates.length; i += BATCH_SIZE) {
  const batch = updates.slice(i, i + BATCH_SIZE);
  const results = await Promise.all(
    batch.map(({ player_id, display_score }) =>
      supabase
        .from("player_career_aggregates")
        .update({
          display_score,
          is_provisional: true,
          tier: "provisional",
          updated_at: new Date().toISOString(),
        })
        .eq("player_id", player_id)
        .eq("vote_count", 0)
        .select("player_id")
        .then(({ data, error: updateError }) => {
          if (updateError) return { player_id, ok: false, error: updateError.message };
          if (!data?.length) return { player_id, ok: false, error: "no row matched" };
          return { player_id, ok: true };
        }),
    ),
  );
  for (const res of results) {
    if (res.ok) ok++;
    else failed++;
  }
  process.stdout.write(`\r  progress: ${Math.min(i + BATCH_SIZE, updates.length)}/${updates.length}`);
}
process.stdout.write("\n");

console.log(`Done. ok=${ok} failed=${failed}`);
process.exit(failed > 0 ? 2 : 0);
