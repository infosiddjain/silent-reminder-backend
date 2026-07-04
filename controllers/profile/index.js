import USER from "../../models/users/user.js";
import REMINDER from "../../models/reminder/index.js";

export const profile = async (req, res) => {
  try {
    const user = await USER.findOne({
      _id: req.user.id,
      isDeleted: false,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found.",
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
      message: "Profile fetched successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await USER.findOne({
      _id: req.user.id,
      isDeleted: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found.",
      });
    }

    ((user.isDeleted = true), await user.save());

    await REMINDER.updateMany({ userId: req.user.id }, { isDeleted: true });
    return res.status(200).json({
      success: true,
      data: null,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};
