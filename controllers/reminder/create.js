import REMINDER from "../../models/reminder/index.js";
import { reminderValidation } from "../../validations/reminder.js";
import mongoose from "mongoose";

export const createReminder = async (req, res) => {
  try {
    const error = reminderValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        data: null,
        message: error,
      });
    }

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
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

export const getReminderList = async (req, res) => {
  try {
    const reminder = await REMINDER.find({
      userId: req.user.id,
      isDeleted: false,
    }).sort({ reminderDate: -1 });

    return res.status(200).json({
      success: true,
      total: reminder.length,
      data: reminder,
      message: "Reminder list fetched successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await REMINDER.findOne({
      _id: id,
      userId: req.user.id,
      isDeleted: false,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Reminder not found.",
      });
    }

    ((reminder.isDeleted = true), await reminder.save());

    return res.status(200).json({
      success: true,
      data: null,
      message: "Reminder deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

export const dashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [total, upcoming, completed, today, typeCounts] = await Promise.all([
      REMINDER.countDocuments({
        userId,
        isDeleted: false,
      }),

      REMINDER.countDocuments({
        userId,
        isDeleted: false,
        isCompleted: false,
        reminderDate: { $gte: now },
      }),

      REMINDER.countDocuments({
        userId,
        isDeleted: false,
        isCompleted: true,
      }),

      REMINDER.countDocuments({
        userId,
        isDeleted: false,
        reminderDate: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      }),

      REMINDER.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user.id),
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const types = {
      Event: 0,
      Birthday: 0,
      Medicine: 0,
      Trip: 0,
      Water: 0,
      Personal: 0,
      Business: 0,
      Food: 0,
    };

    typeCounts.forEach((item) => {
      types[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully.",
      data: {
        total,
        upcoming,
        completed,
        today,
        types,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};
