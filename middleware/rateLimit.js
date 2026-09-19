import RATE_LIMIT from "../models/rateLimit/index.js";
import { sendError } from "../utils/response.js";

/**
 * Fixed-window rate limiter backed by MongoDB, so the count is shared by every
 * serverless instance (an in-memory counter would reset on each cold start).
 * If the database is unavailable it fails open rather than blocking users.
 *
 * @param name     rule name, part of the storage key
 * @param windowMs window length in milliseconds
 * @param max      allowed requests per window per key
 * @param keyFn    (req) => string identifying the client
 */
export const rateLimit = ({ name, windowMs, max, keyFn }) => async (req, res, next) => {
  try {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const key = `${name}:${keyFn(req)}:${windowStart}`;

    const entry = await RATE_LIMIT.findOneAndUpdate(
      { key },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(windowStart + windowMs) },
      },
      { upsert: true, returnDocument: "after" },
    );

    const remaining = Math.max(0, max - entry.count);
    res.set("RateLimit-Limit", String(max));
    res.set("RateLimit-Remaining", String(remaining));

    if (entry.count > max) {
      const retryAfter = Math.ceil((windowStart + windowMs - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return sendError(
        res,
        429,
        `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
      );
    }
  } catch (error) {
    console.error("Rate limiter unavailable:", error.message);
  }
  next();
};

export const clientIp = (req) => req.ip || "unknown";

export const clientEmail = (req) =>
  typeof req.body?.email === "string"
    ? req.body.email.trim().toLowerCase().slice(0, 254)
    : "";
