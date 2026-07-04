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

    const activeUser = await USERS.findOne({
      email,
      isDeleted: false,
    });

    if (activeUser) {
      return res.status(409).json({
        success: false,
        data: null,
        message: "Email already registered.",
      });
    }

    await USERS.deleteMany({
      email,
      isDeleted: true,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await USERS.create({
      fullName,
      email,
      gender,
      dob,
      password: hashedPassword,
      isDeleted: false,
    });

    const userData = newUser.toObject();
    delete userData.password;

    return res.status(201).json({
      success: true,
      data: userData,
      message: "User registered successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message,
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

    const user = await USERS.findOne({ email, isDeleted: false });

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
