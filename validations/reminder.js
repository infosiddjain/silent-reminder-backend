export const reminderValidation = (body) => {
  const { type, title, reminderDate } = body;

  if (!type) return "Reminder type is required.";

  if (!title?.trim()) return "Reminder title is required.";

  if (!reminderDate) return "Reminder date is required.";

  const validTypes = [
    "Event",
    "Birthday",
    "Medicine",
    "Trip",
    "Water",
    "Personal",
    "Business",
    "Food",
  ];

  if (!validTypes.includes(type)) {
    return "Invalid reminder type.";
  }

  return null;
};
