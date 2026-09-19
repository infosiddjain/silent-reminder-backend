import jwt from "jsonwebtoken";
import USERS from "../models/users/user.js";
import { sendError } from "../utils/response.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return sendError(res, 401, "Access denied. Token missing.");
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return sendError(res, 401, "Invalid or expired token.");
  }

  try {
    // A token must stop working once its account is deleted.
    const exists = await USERS.exists({ _id: decoded.id, isDeleted: false });
    if (!exists) return sendError(res, 401, "Account no longer exists.");

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Something went wrong. Please try again.");
  }
};
