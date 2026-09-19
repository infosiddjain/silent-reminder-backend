export const sendError = (res, status, message) =>
  res.status(status).json({ success: false, data: null, message });

/** Logs the real error server-side and returns a generic 500 so internals never leak. */
export const serverError = (res, error) => {
  console.error(error);
  return sendError(res, 500, "Something went wrong. Please try again.");
};
