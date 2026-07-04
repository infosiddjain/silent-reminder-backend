import USERS from "../../models/users/user.js";
import bcrypt from "bcrypt";
import { loginValidation, registerValidation } from "../../validations/auth.js";
import jwt from "jsonwebtoken";

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

export const login = async (req, res) => {
  try {
    const error = loginValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        data: null,
        message: error,
      });
    }

    const { email, password } = req.body;

    const user = await USERS.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: "Login successfully",
      token,
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
