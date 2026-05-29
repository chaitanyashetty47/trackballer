import { NextRequest } from "next/server";

export function assertSyncAuthorized(request: NextRequest): Response | null {
  const secret = process.env.SYNC_ADMIN_SECRET;
  if (!secret) {
    return Response.json(
      { error: "SYNC_ADMIN_SECRET is not configured on the server" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const bearer =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const headerSecret = request.headers.get("x-sync-secret");

  if (bearer !== secret && headerSecret !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
