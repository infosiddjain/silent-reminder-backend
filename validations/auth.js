import { REGEX } from "../constant/regex.js";

const isText = (value) => typeof value === "string" && value.trim().length > 0;

export const registerValidation = (body = {}) => {
  const { fullName, email, gender, dob, password } = body;

  if (!isText(fullName)) return "FullName is required";
  if (fullName.trim().length > 80) return "FullName is too long";
  if (!isText(email)) return "Email is required";
  if (!REGEX.email.test(email.trim())) return "Enter a valid email address";
  if (!gender) return "Gender is required";
  if (!REGEX.gender.includes(gender)) return "Invalid gender";
  if (!isText(dob)) return "DOB is required";
  if (!REGEX.dob.test(dob.trim())) return "DOB must be in DD-MM-YYYY format";
  if (typeof password !== "string" || !password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (password.length > 72) return "Password must be at most 72 characters.";
  return null;
};

export const loginValidation = (body = {}) => {
  const { email, password } = body;

  if (!isText(email)) return "Email address is required";
  if (!REGEX.email.test(email.trim())) return "Enter a valid email address";
  if (typeof password !== "string" || !password) return "Password is required";
  return null;
};
