/** Terminal fixture statuses — ratings unlock when status is one of these. */
export const TERMINAL_STATUSES = new Set(["FT", "AET", "PEN"]);

const UPCOMING_STATUSES = new Set(["NS", "TBD"]);
const INTERRUPTED_STATUSES = new Set(["PST", "CANC", "SUSP", "ABD", "AWD", "WO"]);

/** In-play or break (1H, HT, 2H, ET, …) — not upcoming, finished, or abandoned. */
export function isLiveMatchStatus(status: string): boolean {
  return (
    !TERMINAL_STATUSES.has(status) &&
    !UPCOMING_STATUSES.has(status) &&
    !INTERRUPTED_STATUSES.has(status)
  );
}

export const DEFAULT_LEAGUE_ID = 1;
export const DEFAULT_SEASON_YEAR = 2022;
