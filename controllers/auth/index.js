import USERS from "../../models/users/user.js";
import REMINDER from "../../models/reminder/index.js";
import bcrypt from "bcrypt";
import { loginValidation, registerValidation } from "../../validations/auth.js";
import { sendError, serverError } from "../../utils/response.js";
import {
  consumeRefreshToken,
  issueRefreshToken,
  revokeRefreshToken,
  signAccessToken,
} from "../../utils/tokens.js";

const toPublicUser = (user) => {
  const data = user.toObject();
  delete data.password;
  return data;
};

export const register = async (req, res) => {
  try {
    const error = registerValidation(req.body);
    if (error) return sendError(res, 400, error);

    const { fullName, gender, dob, password } = req.body;
    const email = req.body.email.trim().toLowerCase();

    const activeUser = await USERS.findOne({ email, isDeleted: false });
    if (activeUser) return sendError(res, 409, "Email already registered.");

    // Clean up accounts soft-deleted by older versions so the unique email frees up.
    const legacy = await USERS.find({ email, isDeleted: true }).select("_id");
    if (legacy.length) {
      const ids = legacy.map((u) => u._id);
      await REMINDER.deleteMany({ userId: { $in: ids } });
      await USERS.deleteMany({ _id: { $in: ids } });
    }

    const newUser = await USERS.create({
      fullName: fullName.trim(),
      email,
      gender,
      dob: dob.trim(),
      password: await bcrypt.hash(password, 10),
    });

    return res.status(201).json({
      success: true,
      data: toPublicUser(newUser),
      message: "User registered successfully.",
    });
  } catch (error) {
    // Two simultaneous sign-ups can slip past the check above; the unique index catches them.
    if (error?.code === 11000) {
      return sendError(res, 409, "Email already registered.");
    }
    return serverError(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const error = loginValidation(req.body);
    if (error) return sendError(res, 400, error);

    const email = req.body.email.trim().toLowerCase();

    const user = await USERS.findOne({ email, isDeleted: false });
    const isMatch = user
      ? await bcrypt.compare(req.body.password, user.password)
      : false;

    // Same answer for "no such user" and "wrong password" so emails can't be probed.
    if (!isMatch) return sendError(res, 401, "Invalid email or password");

    const publicUser = toPublicUser(user);

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      token: signAccessToken(user),
      refreshToken: await issueRefreshToken(user._id),
      user: publicUser,
      data: publicUser,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (typeof refreshToken !== "string" || refreshToken.length < 32) {
      return sendError(res, 400, "Refresh token is required.");
    }

    const userId = await consumeRefreshToken(refreshToken);
    if (!userId) return sendError(res, 401, "Session expired. Please log in again.");

    const user = await USERS.findOne({ _id: userId, isDeleted: false });
    if (!user) return sendError(res, 401, "Account no longer exists.");

    // Rotation: the old refresh token is already consumed; hand out a fresh pair.
    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      token: signAccessToken(user),
      refreshToken: await issueRefreshToken(user._id),
    });
  } catch (error) {
    return serverError(res, error);
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (typeof refreshToken === "string" && refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    // Always succeed: logging out must never fail from the user's point of view.
    return res.status(200).json({ success: true, data: null, message: "Logged out." });
  } catch (error) {
    return serverError(res, error);
  }
};
