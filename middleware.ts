import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Rate limiter configurations
const API_RATE_LIMIT = 20; // Increased from 5 to 20 requests
const TIME_WINDOW = 120; // Increased from 40 to 120 seconds
const TOKEN_EXPIRY = 30; // seconds
const MAX_LOGIN_ATTEMPTS = 3;

export default authMiddleware({
  publicRoutes: ["/"],
  async beforeAuth(req: NextRequest) {
    const ip = req.ip || req.headers.get("x-real-ip");
    const blockKey = `block:${ip}`;

    // Check if IP is blocked
    const isBlocked = await redis.get(blockKey);
    if (isBlocked) {
      return new Response("Too many attempts. Please try again later.", { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '120'
        }
      });
    }

    // Rate limiting logic for API routes
    if (req.nextUrl.pathname.startsWith("/api/")) {
      const key = `rate:${ip}`;
      const count = await redis.incr(key);
      
      if (count === 1) {
        await redis.expire(key, TIME_WINDOW);
      }

      if (count > API_RATE_LIMIT) {
        const attempts = await redis.incr(`attempts:${ip}`);
        if (attempts > MAX_LOGIN_ATTEMPTS) {
          await redis.setex(blockKey, TOKEN_EXPIRY, "1");
        }
        return new Response(JSON.stringify({
          error: "Rate limit exceeded",
          retryAfter: TIME_WINDOW,
          limit: API_RATE_LIMIT,
          remaining: 0
        }), { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': TIME_WINDOW.toString()
          }
        });
      }

      // Add rate limit headers
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', API_RATE_LIMIT.toString());
      response.headers.set('X-RateLimit-Remaining', (API_RATE_LIMIT - count).toString());
      response.headers.set('X-RateLimit-Reset', TIME_WINDOW.toString());
      return response;
    }

    return NextResponse.next();
  },
  async afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return Response.redirect(new URL('/', req.url));
    }

    // If the user is signed in and trying to access the home page,
    // redirect them to the dashboard
    if (auth.userId && req.nextUrl.pathname === '/') {
      return Response.redirect(new URL('/dashboard', req.url));
    }

    // Generate temporary token for authenticated users
    if (auth.userId && req.nextUrl.pathname.startsWith("/api/")) {
      const tempToken = crypto.randomUUID();
      const tokenKey = `token:${auth.userId}:${tempToken}`;
      await redis.setex(tokenKey, TOKEN_EXPIRY, "1");
      
      const response = NextResponse.next();
      response.headers.set("X-Temp-Token", tempToken);
      return response;
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 