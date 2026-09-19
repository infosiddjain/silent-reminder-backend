import express from "express";
import { login, logout, refresh, register } from "../../controllers/auth/index.js";
import { deleteAccount, profile } from "../../controllers/profile/index.js";
import { verifyToken } from "../../helpers/authMiddleware.js";
import { clientEmail, clientIp, rateLimit } from "../../middleware/rateLimit.js";

const MINUTE = 60 * 1000;

// Slows password guessing: per account+IP, and a wider cap per IP across accounts.
const loginPerAccount = rateLimit({
  name: "login-account",
  windowMs: 15 * MINUTE,
  max: 8,
  keyFn: (req) => `${clientIp(req)}:${clientEmail(req)}`,
});
const loginPerIp = rateLimit({
  name: "login-ip",
  windowMs: 15 * MINUTE,
  max: 40,
  keyFn: clientIp,
});
const refreshPerIp = rateLimit({
  name: "refresh-ip",
  windowMs: 15 * MINUTE,
  max: 60,
  keyFn: clientIp,
});
const registerPerIp = rateLimit({
  name: "register-ip",
  windowMs: 60 * MINUTE,
  max: 10,
  keyFn: clientIp,
});

const router = express.Router();

router.post("/register", registerPerIp, register);
router.post("/login", loginPerIp, loginPerAccount, login);
router.post("/refresh", refreshPerIp, refresh);
router.post("/logout", logout);
router.get("/profile", verifyToken, profile);
router.delete("/account-delete", verifyToken, deleteAccount);

export default router;
