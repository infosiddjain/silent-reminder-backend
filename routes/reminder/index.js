import express from "express";
import { createReminder } from "../../controllers/reminder/create.js";
import { verifyToken } from "../../helpers/authMiddleware.js";

const router = express.Router();

router.post("/create-reminder", verifyToken, createReminder);

export default router;
