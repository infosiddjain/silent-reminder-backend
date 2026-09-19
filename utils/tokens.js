import crypto from "crypto";
import jwt from "jsonwebtoken";
import REFRESH_TOKEN from "../models/refreshToken/index.js";

const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "30m";
const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_DAYS) || 90;

const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: ACCESS_EXPIRES_IN,
  });

/** Creates and stores a new opaque refresh token; returns the raw value once. */
export const issueRefreshToken = async (userId) => {
  const token = crypto.randomBytes(48).toString("hex");
  await REFRESH_TOKEN.create({
    userId,
    tokenHash: hash(token),
    expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
  });
  return token;
};

/**
 * Atomically consumes a refresh token (each one is single-use, so a stolen
 * token that was already rotated is rejected). Returns the userId or null.
 */
export const consumeRefreshToken = async (token) => {
  const doc = await REFRESH_TOKEN.findOneAndDelete({
    tokenHash: hash(token),
    expiresAt: { $gt: new Date() },
  });
  return doc ? doc.userId : null;
};

export const revokeRefreshToken = (token) =>
  REFRESH_TOKEN.deleteOne({ tokenHash: hash(token) });

export const revokeAllRefreshTokens = (userId) =>
  REFRESH_TOKEN.deleteMany({ userId });
