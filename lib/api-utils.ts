import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * JSON response with CDN-friendly caching: served from the shared cache for
 * `sMaxAge` seconds, then revalidated in the background for up to `swr`
 * seconds while stale data keeps being served (no browser-level max-age, so
 * clients always get the freshest CDN copy).
 */
export function jsonCached<T>(data: T, sMaxAge = 30, swr = 300) {
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
    },
  });
}

export function jsonMsg(msg: string, status = 200, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ msg, ...extra }, { status });
}

export function jsonError(msg: string, status = 400) {
  return NextResponse.json({ msg }, { status });
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg) return msg;
  }
  return "Server error";
}

function isTransientError(error: unknown): boolean {
  const msg = errorMessage(error).toLowerCase();
  return (
    msg.includes("mongo") ||
    msg.includes("connect") ||
    msg.includes("econnrefused") ||
    msg.includes("timed out") ||
    msg.includes("network")
  );
}

export function handleRouteError(error: unknown) {
  console.error("[api]", errorMessage(error), error);
  const status = isTransientError(error) ? 503 : 500;
  return jsonError(errorMessage(error), status);
}
