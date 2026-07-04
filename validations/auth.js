import { REGEX } from "../constant/regex.js";

export const registerValidation = (body) => {
  const { fullName, email, gender, dob, password } = body;

  if (!fullName?.trim()) {
    return "FullName is required";
  }
  if (!email?.trim()) {
    return "Email is required";
  }
  const emailRegex = REGEX.email;
  if (!emailRegex.test(email)) {
    return "Enter a valid email address";
  }
  if (!gender) {
    return "Gender is required";
  }
  if (!REGEX.gender.includes(gender)) {
    return "Invalid gender";
  }
  if (!dob) {
    return "DOB is required";
  }
  if (!password) {
    return "Password is required";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
};

export const loginValidation = (body) => {
  const { email, password } = body;

  if (!email) {
    return "Email address is required";
  }
  if (!REGEX.email.test(email)) {
    return "Add validation valid email address";
  }
  if (!password) {
    return "Password is required";
  }
  return null;
};
