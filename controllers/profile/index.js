import USER from "../../models/users/user.js";
import REMINDER from "../../models/reminder/index.js";
import { sendError, serverError } from "../../utils/response.js";
import { revokeAllRefreshTokens } from "../../utils/tokens.js";

export const profile = async (req, res) => {
  try {
    const user = await USER.findOne({
      _id: req.user.id,
      isDeleted: false,
    })
      .select("-password")
      .lean();

    if (!user) return sendError(res, 404, "User not found.");

    return res.status(200).json({
      success: true,
      data: user,
      message: "Profile fetched successfully.",
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// Permanently removes the account and its reminders (not just a flag), so the
// data is really gone when a user asks for deletion.
export const deleteAccount = async (req, res) => {
  try {
    const user = await USER.findOneAndDelete({
      _id: req.user.id,
      isDeleted: false,
    });

    if (!user) return sendError(res, 404, "User not found.");

    await Promise.all([
      REMINDER.deleteMany({ userId: req.user.id }),
      revokeAllRefreshTokens(req.user.id),
    ]);

    return res.status(200).json({
      success: true,
      data: null,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    return serverError(res, error);
  }
};
