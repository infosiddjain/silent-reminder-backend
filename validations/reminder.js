import { REMINDER_TYPES } from "../constant/regex.js";

export const reminderValidation = (body = {}) => {
  const { type, title, description, reminderDate } = body;

  if (!type) return "Reminder type is required.";
  if (!REMINDER_TYPES.includes(type)) return "Invalid reminder type.";

  if (typeof title !== "string" || !title.trim()) {
    return "Reminder title is required.";
  }
  if (title.trim().length > 120) return "Reminder title is too long.";

  if (description !== undefined && typeof description !== "string") {
    return "Description must be text.";
  }
  if (description && description.length > 1000) {
    return "Description is too long.";
  }

  if (!reminderDate) return "Reminder date is required.";
  if (Number.isNaN(new Date(reminderDate).getTime())) {
    return "Reminder date is invalid.";
  }

  return null;
};
