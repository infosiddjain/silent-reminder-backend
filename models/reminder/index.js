import mongoose from "mongoose";
import { REMINDER_TYPES } from "../../constant/regex.js";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: REMINDER_TYPES,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    reminderDate: {
      type: Date,
      required: true,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Every query filters by owner + not-deleted and sorts by date.
reminderSchema.index({ userId: 1, isDeleted: 1, reminderDate: -1 });

export default mongoose.model("Reminder", reminderSchema);
