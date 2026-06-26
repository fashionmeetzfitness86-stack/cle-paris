/**
 * cors.ts — Shared CORS / origin validation for Netlify Functions.
 *
 * Allowed origins:
 *   - Production: VITE_SITE_URL env var (e.g. https://cle-paris.com)
 *   - Local dev:  http://localhost:* and http://127.0.0.1:*
 *
 * Usage in a function:
 *   import { corsHeaders, requireOrigin } from "./_cors.js";
 *
 *   export default async (req: Request) => {
 *     const originResponse = requireOrigin(req);
 *     if (originResponse) return originResponse;          // rejected
 *     // … function logic …
 *     return new Response(body, { headers: corsHeaders(req) });
 *   };
 */

/** The set of origins that are allowed to call our functions. */
function getAllowedOrigins(): string[] {
  const allowed: string[] = [
    // localhost variants for local dev
    "http://localhost:5173",
    "http://localhost:8888", // netlify dev default
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8888",
  ];

  // Production / staging origin from env
  const siteUrl = process.env.VITE_SITE_URL || process.env.URL; // URL is set by Netlify automatically
  if (siteUrl) {
    // Normalize: strip trailing slash
    allowed.push(siteUrl.replace(/\/$/, ""));
  }

  return allowed;
}

/** Returns true when the request's Origin header is in the allowed list. */
export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) {
    // No Origin header means the request came from the same origin (e.g. SSR,
    // server-to-server, Netlify's own test runner) — allow it.
    return true;
  }
  // Also allow localhost with any port for local dev flexibility
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  return getAllowedOrigins().includes(origin);
}

/** CORS headers to attach to every response from an allowed origin. */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Handle preflight OPTIONS requests and reject disallowed origins.
 * Returns a Response if the request should be short-circuited,
 * or null if the handler should proceed.
 */
export function requireOrigin(req: Request): Response | null {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    if (!isAllowedOrigin(req)) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  // Reject requests from unauthorized origins
  if (!isAllowedOrigin(req)) {
    return new Response(
      JSON.stringify({ error: "Forbidden: origin not allowed." }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return null; // Caller may proceed
}
