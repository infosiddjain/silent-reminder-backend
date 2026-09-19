export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  gender: ["male", "female", "other"],
  dob: /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/,
};

export const REMINDER_TYPES = [
  "Event",
  "Birthday",
  "Medicine",
  "Trip",
  "Water",
  "Personal",
  "Business",
  "Food",
];
