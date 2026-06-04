# Publish Slice 13 vertical-slice issues to GitHub.
# Prerequisites: gh auth login; Slices 7-12 issues already published (#55-#65).
# Usage: powershell -ExecutionPolicy Bypass -File ./scripts/publish-slice-issues-13.ps1

$ErrorActionPreference = "Stop"

$gh = if (Get-Command gh -ErrorAction SilentlyContinue) {
  "gh"
} elseif (Test-Path "$env:USERPROFILE\.local\bin\gh.exe") {
  "$env:USERPROFILE\.local\bin\gh.exe"
} else {
  throw "GitHub CLI not found. Install gh or run winget install GitHub.cli"
}

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  throw "Not logged in. Run: gh auth login"
}

function Ensure-Label {
  param([string]$Name, [string]$Color, [string]$Description = "")
  $existing = & $gh label list --limit 200 --json name --jq ".[].name" 2>$null
  if ($existing -notcontains $Name) {
    if ($Description) {
      & $gh label create $Name --color $Color --description $Description --force | Out-Null
    } else {
      & $gh label create $Name --color $Color --force | Out-Null
    }
    Write-Host "Created label: $Name"
  }
}

function New-SliceIssue {
  param(
    [string]$Key,
    [string]$Title,
    [string[]]$Labels,
    [string]$Parent,
    [string]$WhatToBuild,
    [string[]]$Acceptance,
    [string[]]$BlockedByKeys = @(),
    [string[]]$BlockedByNotes = @()
  )

  $blockedLines = @()
  foreach ($k in $BlockedByKeys) {
    if (-not $script:IssueMap.ContainsKey($k)) {
      throw "Missing blocker issue key: $k for $Key"
    }
    $blockedLines += "- #$($script:IssueMap[$k])"
  }
  foreach ($note in $BlockedByNotes) {
    $blockedLines += "- $note"
  }

  $blockedSection = if ($blockedLines.Count -eq 0) {
    "None - can start immediately"
  } else {
    $blockedLines -join "`n"
  }

  $acceptanceSection = ($Acceptance | ForEach-Object { "- [ ] $_" }) -join "`n"

  $body = @"
## Parent

$Parent

## What to build

$WhatToBuild

## Acceptance criteria

$acceptanceSection

## Blocked by

$blockedSection
"@

  $labelArgs = $Labels | ForEach-Object { "--label"; $_ }
  $issueUrl = & $gh issue create --title $Title --body $body @labelArgs
  $issueNum = ($issueUrl -replace '.*/', '')
  $script:IssueMap[$Key] = [int]$issueNum
  Write-Host "Created $Key -> #$issueNum $Title"
  return [int]$issueNum
}

Write-Host "Ensuring labels..."
Ensure-Label "afk" "0E8A16" "Can implement without product decisions"
Ensure-Label "hitl" "D93F0B" "Needs human/product decision"
Ensure-Label "slice-11" "FBCA04" "Home dashboard"
Ensure-Label "slice-12" "D4C5F9" "Search and players browse"
Ensure-Label "slice-13" "BFDADC" "Admin panel editorial"

# External blockers from prior slices (already on GitHub)
$script:IssueMap = @{
  "10-6" = 54
  "11-1" = 55
  "11-2" = 56
  "12-2" = 62
}

Write-Host ""
Write-Host "Publishing Slice 13 issues..."

New-SliceIssue -Key "13-1" -Title "13-1: Admin gate + layout shell" -Labels @("afk", "slice-13") `
  -Parent "Slice 13 - Admin panel (super-admin only) | to-do-list.md - PRD stories 10, 41, 42, 43, 44" `
  -WhatToBuild "lib/admin/require-admin.ts: load session, verify profiles.is_admin, redirect others to home. app/admin/layout.tsx: stripped chrome with no TopNav or nav search (see search_functionality.md). Optional proxy.ts guard for /admin routes. NOT the catalog sync API (/api/admin/sync + SYNC_ADMIN_SECRET) - editorial admin uses signed-in OAuth + is_admin. Document bootstrap: set is_admin true on your profile in Supabase for the first super-admin. RLS on featured_trending_players, team_of_the_week tables, and comment admin delete already exists via public.is_admin() - verify, no duplicate policies." `
  -Acceptance @(
  "Non-admin signed-in user cannot access /admin routes"
  "Guest redirected to login or home per existing auth pattern"
  "Admin layout hides main app TopNav"
  "Bootstrap steps noted in PR or supabase/README.md"
)

New-SliceIssue -Key "13-2" -Title "13-2: Admin hub tiles" -Labels @("afk", "slice-13") `
  -Parent "Slice 13 - Admin panel (super-admin only)" `
  -BlockedByKeys @("13-1") `
  -WhatToBuild "/admin hub page with four tiles per wireframe section 11: Trending players, Team of the Stage, Comments mod, Fix data. Links to /admin/trending, /admin/team-of-the-stage, /admin/comments, /admin/data. Mobile-friendly 2x2 grid." `
  -Acceptance @(
  "Admin lands on hub after passing gate"
  "All four tiles navigate to stub or implemented sub-routes"
  "Page title and copy use plain language"
)

New-SliceIssue -Key "13-3" -Title "13-3: Trending players pin editor" -Labels @("afk", "slice-13") `
  -Parent "Slice 13 - Admin panel (super-admin only)" `
  -BlockedByKeys @("13-2", "12-2", "11-2") `
  -WhatToBuild "/admin/trending: list featured_trending_players ordered by sort_order. Add pin via player search (reuse SearchCombobox or nav search pattern). Remove pin. Reorder via drag or up/down buttons. Save through authenticated Supabase client (RLS featured_trending_admin_write). Set pinned_by to current admin. Optional starts_at and ends_at if low effort. Home read path in lib/home/trending-players.ts (Slice 11) - pins appear on home after save." `
  -Acceptance @(
  "Admin can add, remove, and reorder pins"
  "Duplicate player_id prevented or handled gracefully"
  "Saved pins render on home trending section (story 42)"
  "Non-admin cannot call write actions"
)

New-SliceIssue -Key "13-4" -Title "13-4: Formation picker + Team of the Stage editor" -Labels @("afk", "slice-13") `
  -Parent "Slice 13 - Admin panel (super-admin only)" `
  -BlockedByKeys @("13-2", "12-2") `
  -WhatToBuild "/admin/team-of-the-stage editor per wireframe section 11. lib/admin/formation-slots.ts: static formation templates (4-3-3, 4-4-2, 3-5-2) mapping slot keys to pitch positions - editorial mini pitch, not match LineupPitch coordinates. UI: formation dropdown, optional WC round selector, title field, tap slot then player search then assign. Eleven slots required before publish. Publish inserts team_of_the_week (season_id from WC env, formation, title, published_at now, created_by) and replaces team_of_the_week_players rows. Reuse player search from Slice 12." `
  -Acceptance @(
  "Admin picks formation and assigns 11 distinct players"
  "Publish sets published_at and persists slot rows"
  "Draft without publish does not show on public pages"
  "Formation picker works on mobile tap targets"
)

New-SliceIssue -Key "13-5" -Title "13-5: Comment moderation + ban user" -Labels @("afk", "slice-13") `
  -Parent "Slice 13 - Admin panel (super-admin only)" `
  -BlockedByKeys @("13-2", "10-6") `
  -WhatToBuild "/admin/comments: paginated recent comments with author, excerpt, link to player or match page. Soft-delete comment (existing admin RLS on comments). Ban user: set profiles.is_banned true. Migration: RLS policy for is_admin to UPDATE is_banned on other users (block self-elevating is_admin via client). Banned users already blocked in submit-comment.ts - verify after ban." `
  -Acceptance @(
  "Admin can soft-delete any comment"
  "Admin can ban comment author; banned user cannot post new comments"
  "Migration adds safe admin ban policy"
  "Delete and ban require confirmation in UI"
)

New-SliceIssue -Key "13-6" -Title "13-6: Catalog data fix (player name + photo)" -Labels @("afk", "slice-13") `
  -Parent "Slice 13 - Admin panel (super-admin only)" `
  -BlockedByKeys @("13-2", "12-2") `
  -WhatToBuild "/admin/data: search player by name or id. Form to edit players.name and players.photo_url. Writes via service role server action (createAdminClient) - catalog is not user-writable under RLS. Never downgrade a real name to Player {id}. Story 44 - correct API sync errors without full bootstrap." `
  -Acceptance @(
  "Admin can fix typo in player name and broken photo URL"
  "Change visible on player page after save"
  "Service role key never exposed to browser"
  "Invalid name rejected with actionable error"
)

New-SliceIssue -Key "13-7" -Title "13-7: Team of the Stage display (home + WC)" -Labels @("afk", "slice-13") `
  -Parent "Slice 13 - Admin panel (super-admin only)" `
  -BlockedByKeys @("13-4", "11-1") `
  -WhatToBuild "Public read for latest published team_of_the_week for current WC season (lib/home/team-of-the-stage.ts). Home: Team of the Stage strip below trending comments per wireframe section 1, link to /world-cup with totw anchor. World Cup hub: section at totw anchor per wireframe section 2. Query published_at IS NOT NULL, join team_of_the_week_players and players." `
  -Acceptance @(
  "Latest published XI renders on home when data exists"
  "WC page shows same published team at totw anchor"
  "Empty state when nothing published yet"
  "Guest and logged-in users can view (public read RLS)"
)

New-SliceIssue -Key "13-8" -Title "13-8: E2E smoke - admin editorial flows" -Labels @("afk", "slice-13") `
  -Parent "Slice 13 - Admin panel (super-admin only)" `
  -BlockedByKeys @("13-3", "13-4", "13-5", "13-6", "13-7") `
  -WhatToBuild "Manual smoke or scripted E2E: (1) admin pins a player and home trending shows pinned order; (2) admin publishes Team of the Stage XI and home strip plus WC totw section show the XI; (3) admin deletes a comment and bans author and author cannot post." `
  -Acceptance @(
  "Pin to home trending verified with documented player id"
  "Publish TOTW visible on home and world-cup totw anchor"
  "Ban flow verified on test account"
  "Smoke steps in PR test plan or README"
)

Write-Host ""
Write-Host "Done! Created $($script:IssueMap.Count - 4) Slice 13 issues."
Write-Host "Issue map (slice 13):"
$script:IssueMap.GetEnumerator() | Sort-Object { [int]($_.Key -replace '^\d+-', '') } | ForEach-Object {
  if ($_.Key -match '^13-') { Write-Host "  $($_.Key) -> #$($_.Value)" }
}
