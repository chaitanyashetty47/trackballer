/**
 * Vercel Hobby max Serverless Function duration (seconds).
 *
 * Each app/api route file that sets maxDuration must use the literal 300
 * in that file — Vercel reads it at build time and does not accept values above 300
 * on Hobby. Do not import this into route files; keep routes in sync manually.
 */
export const VERCEL_HOBBY_MAX_DURATION_SECONDS = 300
