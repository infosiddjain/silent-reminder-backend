import USERS from "../../models/users/user.js";
import bcrypt from "bcrypt";
import { registerValidation } from "../../validations/auth.js";

export const register = async (req, res) => {
  try {
    const error = registerValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        data: null,
        message: error,
      });
    }

    const { fullName, email, gender, dob, password } = req.body;

    const user = await USERS.findOne({ email });
    if (user) {
      return res.status(409).json({
        success: false,
        data: null,
        message: "Email already registered.",
      });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const newUser = await USERS.create({
      fullName,
      email,
      gender,
      dob,
      password: hashPass,
    });

    res.status(201).json({
      success: true,
      data: newUser,
      message: "User registered successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: `register api error ${error.message}`,
    });
  }
};
