import express from "express";
import {
  createReminder,
  deleteReminder,
  getReminderList,
} from "../../controllers/reminder/create.js";
import { verifyToken } from "../../helpers/authMiddleware.js";

const router = express.Router();

router.post("/create-reminder", verifyToken, createReminder);
router.get("/list-reminder", verifyToken, getReminderList);
router.delete("/delete-reminder/:id", verifyToken, deleteReminder);
export default router;
