import mongoose from "mongoose";
import REMINDER from "../../models/reminder/index.js";
import { reminderValidation } from "../../validations/reminder.js";
import { REMINDER_TYPES } from "../../constant/regex.js";
import { sendError, serverError } from "../../utils/response.js";

export const createReminder = async (req, res) => {
  try {
    const error = reminderValidation(req.body);
    if (error) return sendError(res, 400, error);

    const { type, title, description, reminderDate } = req.body;

    const reminder = await REMINDER.create({
      userId: req.user.id,
      type,
      title,
      description,
      reminderDate,
    });

    return res.status(201).json({
      success: true,
      data: reminder,
      message: "Reminder created successfully.",
    });
  } catch (error) {
    return serverError(res, error);
  }
};

export const getReminderList = async (req, res) => {
  try {
    const reminder = await REMINDER.find({
      userId: req.user.id,
      isDeleted: false,
    })
      .sort({ reminderDate: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      total: reminder.length,
      data: reminder,
      message: "Reminder list fetched successfully.",
    });
  } catch (error) {
    return serverError(res, error);
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid reminder id.");
    }

    const reminder = await REMINDER.findOneAndUpdate(
      { _id: id, userId: req.user.id, isDeleted: false },
      { isDeleted: true },
    );

    if (!reminder) return sendError(res, 404, "Reminder not found.");

    return res.status(200).json({
      success: true,
      data: null,
      message: "Reminder deleted successfully.",
    });
  } catch (error) {
    return serverError(res, error);
  }
};

export const dashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // One pass over the user's reminders instead of five separate queries.
    const rows = await REMINDER.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$isCompleted", 1, 0] } },
          upcoming: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isCompleted", false] },
                    { $gte: ["$reminderDate", now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          today: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$reminderDate", startOfToday] },
                    { $lte: ["$reminderDate", endOfToday] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const types = Object.fromEntries(REMINDER_TYPES.map((t) => [t, 0]));
    const data = { total: 0, upcoming: 0, completed: 0, today: 0, types };

    for (const row of rows) {
      types[row._id] = row.total;
      data.total += row.total;
      data.upcoming += row.upcoming;
      data.completed += row.completed;
      data.today += row.today;
    }

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully.",
      data,
    });
  } catch (error) {
    return serverError(res, error);
  }
};
