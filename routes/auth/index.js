import express from "express";
import { login, register } from "../../controllers/auth/index.js";
import { deleteAccount, profile } from "../../controllers/profile/index.js";
import { verifyToken } from "../../helpers/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, profile);
router.delete("/account-delete", verifyToken, deleteAccount);

export default router;
