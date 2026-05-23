import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter for development
// In production, use Upstash Redis
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const CONFIGS: Record<string, RateLimitConfig> = {
  auth: { limit: 10, windowMs: 15 * 60 * 1000 },
  api: { limit: 100, windowMs: 60 * 1000 },
  ai: { limit: 20, windowMs: 60 * 1000 },
  upload: { limit: 10, windowMs: 60 * 1000 },
};

export function rateLimit(type: keyof typeof CONFIGS = "api") {
  const config = CONFIGS[type];

  return async function rateLimitMiddleware(
    request: NextRequest,
    identifier?: string,
  ): Promise<{ success: boolean; remaining: number; reset: number } | NextResponse> {
    const ip =
      identifier ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const key = `${type}:${ip}`;
    const now = Date.now();

    const existing = requestCounts.get(key);

    if (!existing || existing.resetTime < now) {
      requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return { success: true, remaining: config.limit - 1, reset: now + config.windowMs };
    }

    if (existing.count >= config.limit) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `Rate limit exceeded. Try again in ${Math.ceil((existing.resetTime - now) / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((existing.resetTime - now) / 1000)),
            "X-RateLimit-Limit": String(config.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(existing.resetTime),
          },
        },
      );
    }

    existing.count++;
    return { success: true, remaining: config.limit - existing.count, reset: existing.resetTime };
  };
}

export function withRateLimit(type: keyof typeof CONFIGS = "api") {
  return async function <T>(
    request: NextRequest,
    handler: () => Promise<NextResponse<T>>,
  ): Promise<NextResponse> {
    const limiter = rateLimit(type);
    const result = await limiter(request);

    if (result instanceof NextResponse) return result;
    return handler();
  };
}
