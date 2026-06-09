import { describe, expect, it, vi } from "vitest"

import {
  getFullAuthUser,
  getServerAuth,
  requireServerAuth,
} from "../server-session"

function mockSupabase(overrides: {
  getClaims?: () => Promise<{ data: unknown; error: unknown }>
  getUser?: () => Promise<{ data: { user: unknown } }>
}) {
  return {
    auth: {
      getClaims: overrides.getClaims ?? vi.fn(),
      getUser: overrides.getUser ?? vi.fn(),
    },
  } as never
}

describe("getServerAuth", () => {
  it("returns null when getClaims errors", async () => {
    const supabase = mockSupabase({
      getClaims: async () => ({ data: null, error: new Error("bad token") }),
    })

    expect(await getServerAuth(supabase)).toBeNull()
  })

  it("returns null when sub is missing", async () => {
    const supabase = mockSupabase({
      getClaims: async () => ({
        data: { claims: { app_metadata: {} } },
        error: null,
      }),
    })

    expect(await getServerAuth(supabase)).toBeNull()
  })

  it("maps sub to userId and parses app_metadata", async () => {
    const supabase = mockSupabase({
      getClaims: async () => ({
        data: {
          claims: {
            sub: "user-uuid-1",
            app_metadata: { is_admin: true, is_onboarded: true },
          },
        },
        error: null,
      }),
    })

    expect(await getServerAuth(supabase)).toEqual({
      userId: "user-uuid-1",
      isAdmin: true,
      isOnboarded: true,
    })
  })
})

describe("requireServerAuth", () => {
  it("returns error when signed out", async () => {
    const supabase = mockSupabase({
      getClaims: async () => ({ data: null, error: new Error("no session") }),
    })

    expect(await requireServerAuth(supabase)).toEqual({
      ok: false,
      error: "Sign in to continue.",
    })
  })

  it("returns auth when signed in", async () => {
    const supabase = mockSupabase({
      getClaims: async () => ({
        data: {
          claims: {
            sub: "user-uuid-2",
            app_metadata: {},
          },
        },
        error: null,
      }),
    })

    const result = await requireServerAuth(supabase)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.auth.userId).toBe("user-uuid-2")
    }
  })
})

describe("getFullAuthUser", () => {
  it("returns user from getUser", async () => {
    const user = { id: "user-uuid-3", identities: [] }
    const supabase = mockSupabase({
      getUser: async () => ({ data: { user } }),
    })

    expect(await getFullAuthUser(supabase)).toEqual(user)
  })

  it("returns null when no user", async () => {
    const supabase = mockSupabase({
      getUser: async () => ({ data: { user: null } }),
    })

    expect(await getFullAuthUser(supabase)).toBeNull()
  })
})
