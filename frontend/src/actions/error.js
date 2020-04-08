export const errorRaised = (status, message, stack) => ({
  type: "ERROR_RAISED",
  status,
  message,
  stack
});

export const errorCleared = () => ({
  type: "ERROR_CLEARED"
});
