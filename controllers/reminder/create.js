import REMINDER from "../../models/reminder/index.js";
import { reminderValidation } from "../../validations/reminder.js";

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
