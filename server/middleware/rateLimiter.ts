import type { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
}, 60000);

export function createRateLimiter(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || (req as any).connection?.remoteAddress || "unknown";
    const now = Date.now();
    
    let entry = rateLimitStore.get(identifier);
    
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitStore.set(identifier, entry);
    } else {
      entry.count++;
      
      if (entry.count > maxRequests) {
        res.status(429).json({
          message: "Too many requests, please try again later",
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        });
        return;
      }
    }
    
    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", (maxRequests - entry.count).toString());
    res.setHeader("X-RateLimit-Reset", new Date(entry.resetTime).toISOString());
    
    next();
  };
}

// Specialized rate limiters for different endpoints
export const apiRateLimiter = createRateLimiter(100, 60000); // 100 requests per minute
export const authRateLimiter = createRateLimiter(5, 60000); // 5 auth attempts per minute
export const paymentRateLimiter = createRateLimiter(10, 60000); // 10 payment operations per minute