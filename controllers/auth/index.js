import USERS from "../../models/users/user.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, gender, dob, password } = req.body;
    console.log("check", fullName, email, gender, dob, password);
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: `register api error ${error.message}`,
    });
  }
};
